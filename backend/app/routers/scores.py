from typing import List

from fastapi import APIRouter

from app.models.score import QuizSession
from app.services import question_service

router = APIRouter(prefix="/scores", tags=["scores"])


@router.post("", response_model=dict)
async def save_score(session: QuizSession):
    question_service.append_score(session)
    return {"session_id": session.session_id}


@router.get("", response_model=List[QuizSession])
async def get_scores():
    raw = question_service.load_scores()
    return [QuizSession(**s) for s in raw]
