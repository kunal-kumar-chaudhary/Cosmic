from fastapi import APIRouter
from pydantic import BaseModel
from transformers import pipeline

summarizer = pipeline("summarization", model="Falconsai/text_summarization")

class SummaryRequest(BaseModel):
    text: str
    
router = APIRouter()

@router.post("/")
async def generate_summary(request: SummaryRequest):
    summary = summarizer(request.text, max_length=50, min_length=20, do_sample=False)

    return {"message": summary}