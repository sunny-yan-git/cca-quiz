from fastapi import APIRouter, HTTPException

from app.models.score import AnswerRequest, AnswerResult, ScoresSummary
from app.services import question_service

router = APIRouter(tags=["scores"])


@router.post("", response_model=AnswerResult)
async def submit_answer(req: AnswerRequest):
    question = question_service.get_question_by_id(req.question_id)
    if question is None:
        raise HTTPException(status_code=404, detail=f"Question '{req.question_id}' not found.")

    correct = req.selected_answer == question.correct_answer
    question_service.write_answer_result(req.session_id, req, correct)

    return AnswerResult(
        correct=correct,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        domain=question.domain,
    )


@router.get("", response_model=ScoresSummary)
async def get_scores():
    return question_service.read_scores()
