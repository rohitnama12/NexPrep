import httpx
import json
from app.models.schemas import TestCase, ExecutionResultPayload, TestCaseResult
from app.services.llm_client import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

# Map frontend languages to piston language identifiers
LANGUAGE_MAP = {
    "python": {"language": "python", "version": "3.10.0"},
    "javascript": {"language": "javascript", "version": "18.15.0"},
    "cpp": {"language": "c++", "version": "10.2.0"}
}

async def execute_code_on_piston(code: str, language: str, test_case: TestCase) -> dict:
    lang_info = LANGUAGE_MAP.get(language.lower(), LANGUAGE_MAP["python"])
    
    payload = {
        "language": lang_info["language"],
        "version": lang_info["version"],
        "files": [{"content": code}],
        "stdin": test_case.input,
        "compile_timeout": 3000,
        "run_timeout": 3000,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(PISTON_API_URL, json=payload, timeout=10.0)
        response.raise_for_status()
        return response.json()

async def fallback_llm_execution(code: str, language: str, test_cases: list[TestCase]) -> ExecutionResultPayload:
    llm = await get_llm(temperature=0.0)
    
    system_prompt = """You are a strict static code compiler and execution engine. 
    Evaluate the user's code against the provided test cases. 
    You must respond ONLY with a valid JSON object matching this schema:
    {
      "success": boolean,
      "results": [
         {
            "passed": boolean,
            "input": "string",
            "expected": "string",
            "actual": "string",
            "error_message": "string or null"
         }
      ],
      "fallback_used": true
    }
    DO NOT wrap the JSON in markdown code blocks. Output RAW JSON.
    CRITICAL: For each test case, you must populate two fields on failure. In `actual`, provide the exact raw string or data structure that the user's faulty code evaluated to (e.g., if they returned a list `[1, 2, 3]` instead of an integer, `actual` must be `[1, 2, 3]`). In `error_message`, provide your natural language explanation of why it is logically incorrect or the syntax error trace. Ensure the `passed` boolean is set to false."""

    prompt = f"Language: {language}\nCode:\n{code}\nTest Cases:\n{json.dumps([tc.model_dump() for tc in test_cases])}"
    
    try:
        response = await llm.ainvoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        
        # Apply empty output fallback to AI results
        if "results" in data:
            for res in data["results"]:
                actual_output = res.get("actual", "")
                if not actual_output or str(actual_output).strip() == "":
                    res["actual"] = "No output returned. Did you instantiate the class and call the method?"
        
        return ExecutionResultPayload(**data)
    except Exception as e:
        results = [
            TestCaseResult(
                passed=False, input=tc.input, expected=tc.expected_output,
                actual="", error_message=f"LLM Fallback failed: {str(e)}"
            )
            for tc in test_cases
        ]
        return ExecutionResultPayload(success=False, results=results, fallback_used=True)

async def run_code_against_tests(code: str, language: str, test_cases: list[TestCase]) -> ExecutionResultPayload:
    results = []
    success = True
    
    try:
        for tc in test_cases:
            try:
                res = await execute_code_on_piston(code, language, tc)
                run_res = res.get("run", {})
                compile_res = res.get("compile", {})
                
                # Check for compile errors
                if compile_res and compile_res.get("code", 0) != 0:
                     results.append(TestCaseResult(
                        passed=False, input=tc.input, expected=tc.expected_output, 
                        actual="", error_message=compile_res.get("stderr", "Compilation Error")
                     ))
                     success = False
                     continue
                
                raw_output = run_res.get("stdout", "")
                output = str(raw_output).strip() if raw_output else ""
                
                if not output or output == "":
                    output = "No output returned. Did you instantiate the class and call the method?"
                    
                stderr = run_res.get("stderr", "").strip()
                code_status = run_res.get("code", 0)
                
                if code_status != 0 or stderr:
                     results.append(TestCaseResult(
                        passed=False, input=tc.input, expected=tc.expected_output, 
                        actual=output, error_message=stderr or f"Exited with code {code_status}"
                     ))
                     success = False
                     continue
                     
                passed = (output == tc.expected_output.strip())
                if not passed:
                    success = False
                    
                results.append(TestCaseResult(
                    passed=passed, input=tc.input, expected=tc.expected_output, 
                    actual=output, error_message=None
                ))
                
            except httpx.ReadTimeout:
                 results.append(TestCaseResult(
                     passed=False, input=tc.input, expected=tc.expected_output, 
                     actual="", error_message="Execution Timeout (Infinite Loop Detected)"
                 ))
                 success = False
                 
    except httpx.HTTPError as e:
        # API is down or returned 500, trigger fallback
        print(f"Piston API failed ({str(e)}). Triggering AI fallback...")
        return await fallback_llm_execution(code, language, test_cases)
        
    return ExecutionResultPayload(success=success, results=results, fallback_used=False)
