from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Common schemas
class ErrorResponse(BaseModel):
    detail: str

# Piston execution schemas
class CodeExecutionRequest(BaseModel):
    language: str
    version: str
    files: List[Dict[str, str]]
    args: Optional[List[str]] = []
    stdin: Optional[str] = ""

class CodeExecutionResponse(BaseModel):
    run: Dict[str, Any]
    compile: Optional[Dict[str, Any]] = None

# Chat schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    messages: List[ChatMessage]
    resume_context: Optional[str] = None

class TutorSession(BaseModel):
    id: str
    title: str
    created_at: str

class TutorMessage(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: str

# Arena schemas
class TestCase(BaseModel):
    input: str
    expected_output: str

class Example(BaseModel):
    input: str = ""
    output: str = ""
    explanation: Optional[str] = ""

class GeneratedProblem(BaseModel):
    title: str = "Coding Challenge"
    description: str = "Complete the coding challenge."
    topic: Optional[str] = "General"
    difficulty: Optional[str] = "Medium"
    constraints: Optional[List[str]] = []
    examples: Optional[List[Example]] = []
    boilerplate_code: str = "# Write your code here\n"
    hidden_test_cases: Optional[List[TestCase]] = []
    playlists: Optional[List[str]] = []
    solution_article: Optional[str] = ""

class ProblemRequest(BaseModel):
    category: Optional[str] = "DSA"
    playlist: Optional[str] = "all"
    difficulty: str
    topic: str
    language: str

class ArenaExecutionRequest(BaseModel):
    code: str
    language: str
    test_cases: List[TestCase]

class TestCaseResult(BaseModel):
    passed: bool
    input: str
    expected: str
    actual: Optional[str] = ""
    error_message: Optional[str] = ""

class ExecutionResultPayload(BaseModel):
    success: bool
    results: List[TestCaseResult]
    fallback_used: bool = False

class HintRequest(BaseModel):
    code: str
    problem_description: str

# MCQ Schemas
class MCQQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str

class MCQQuiz(BaseModel):
    questions: List[MCQQuestion]

class MCQRequest(BaseModel):
    topic: str
    difficulty: str
    question_count: int = 10

# History Tracking Schemas
class ChallengeHistoryCreate(BaseModel):
    category: str
    topic: str
    difficulty: str
    code_snippet: str
    passed: bool
    problem_payload: Optional[Dict[str, Any]] = None

class MCQHistoryCreate(BaseModel):
    topic: str
    difficulty: str
    score: int
    total_questions: int

# ─── DSA Tracker Schemas ────────────────────────────────────────────────────

class DSASheetProblem(BaseModel):
    id: Optional[str] = None
    title: str
    title_slug: str
    topic: str
    difficulty: str
    playlists: List[str] = []
    leetcode_url: Optional[str] = None
    gfg_url: Optional[str] = None

class ProgressToggleRequest(BaseModel):
    question_id: str
    is_completed: bool
