import random

from fastapi import APIRouter, HTTPException

from app.models.question import QuestionRequest, QuestionResponse
from app.services import claude_service, question_service

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/generate", response_model=QuestionResponse)
async def generate_question(req: QuestionRequest):
    question = None

    if random.random() < 0.7:
        exam_guide = claude_service.load_exam_guide()
        try:
            question = await claude_service.generate_question(
                domain=req.domain,
                difficulty=req.difficulty.value,
                exam_guide_content=exam_guide,
            )
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc))

    if question is None:
        question = question_service.get_random_question(
            domain=req.domain,
            difficulty=req.difficulty.value,
        )

    if question is None:
        raise HTTPException(status_code=404, detail="No question available for the requested filters.")

    return QuestionResponse(
        id=question.id,
        domain=question.domain,
        scenario=question.scenario,
        difficulty=question.difficulty,
        scenario_context=question.scenario_context,
        question=question.question,
        options=question.options,
    )


@router.get("/topics")
async def get_topics():
    questions = question_service.get_all_questions()
    domains = sorted({q.domain for q in questions})
    scenarios = sorted({q.scenario for q in questions})
    return {"domains": domains, "scenarios": scenarios}
