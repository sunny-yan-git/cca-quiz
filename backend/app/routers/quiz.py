from typing import List

from fastapi import APIRouter, HTTPException

from app.models.question import Question, QuizRequest
from app.services import claude_service, question_service

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.get("/topics", response_model=List[str])
async def get_topics():
    return question_service.get_topics()


@router.post("/generate", response_model=List[Question])
async def generate_quiz(req: QuizRequest):
    weights = None
    if req.use_weights:
        weights = question_service.load_focus_weights()

    try:
        questions = await claude_service.generate_questions(
            count=req.count,
            topic=req.topic,
            difficulty=req.difficulty,
            topic_weights=weights,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return questions
