from fastapi import APIRouter, HTTPException

from app.models.question import QuestionRequest, QuestionResponse
from app.services import claude_service, question_service
from app.services.question_service import cache_question, get_target_subdomain

router = APIRouter(tags=["quiz"])


@router.post("/generate", response_model=QuestionResponse)
async def generate_question(req: QuestionRequest):
    exam_guide = claude_service.load_exam_guide()

    # Resolve target domain and subdomain via rotation tracker
    target_domain, target_subdomain = get_target_subdomain(req.domain)
    print(f"DEBUG rotation → domain: {target_domain}, subdomain: {target_subdomain}")

    try:
        question = await claude_service.generate_question(
            domain=target_domain,
            difficulty=req.difficulty.value,
            exam_guide_content=exam_guide,
            subdomain=target_subdomain,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    if question is None:
        question = question_service.get_random_question(
            domain=target_domain,
            difficulty=req.difficulty.value,
            subdomain=target_subdomain,
        )

    if question is None:
        raise HTTPException(status_code=503, detail="No questions available")

    cache_question(question)
    return QuestionResponse(
        id=question.id,
        domain=question.domain,
        subdomain=question.subdomain,
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
