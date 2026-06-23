from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import get_current_user, security
from app.services.db_client import get_auth_supabase
import fitz  # PyMuPDF
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Accept a PDF resume, extract text using PyMuPDF, and save it
    to the user's profile in the Supabase 'profiles' table.
    """
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    try:
        # Read the uploaded file bytes
        contents = await file.read()

        # Extract text from PDF using PyMuPDF
        doc = fitz.open(stream=contents, filetype="pdf")
        resume_text = ""
        for page in doc:
            resume_text += page.get_text()
        doc.close()

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract any text from the PDF. Ensure it is not image-only.")

        # Save resume_text to the user's profile via RLS-authenticated client
        token = credentials.credentials
        supabase = get_auth_supabase(token)
        user_id = user.id

        # Upsert: insert if not exists, update if exists
        supabase.table("profiles").upsert(
            {"id": user_id, "resume_text": resume_text},
            on_conflict="id"
        ).execute()

        return {"status": "success", "message": "Resume uploaded and parsed successfully.", "chars_extracted": len(resume_text)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")
