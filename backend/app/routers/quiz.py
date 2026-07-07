from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.models.question import ClearSessionRequest, QuestionRequest, QuestionResponse
from app.services import claude_service, question_service
from app.services.question_service import (
    cache_question,
    clear_buffered_question,
    clear_served_questions,
    get_buffered_question,
    get_served_question_ids,
    get_target_subdomain,
    mark_question_served,
    prefetch_next_question,
)

router = APIRouter(tags=["quiz"])


@router.post("/generate", response_model=QuestionResponse)
async def generate_question(req: QuestionRequest, background_tasks: BackgroundTasks):
    exam_guide = claude_service.load_exam_guide()

    question = get_buffered_question(req.session_id)

    if question:
        print(f"DEBUG buffer hit → serving {question.id} instantly")
    else:
        print("DEBUG buffer miss → generating on demand")
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
                exclude_ids=list(get_served_question_ids(req.session_id)),
                subdomain=target_subdomain,
            )

        if question is None:
            raise HTTPException(status_code=503, detail="No questions available")

    cache_question(question)
    mark_question_served(req.session_id, question.id)

    background_tasks.add_task(
        prefetch_next_question,
        req.session_id,
        req.domain,
        req.difficulty.value,
        exam_guide,
    )

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


@router.post("/clear-session")
async def clear_session(req: ClearSessionRequest):
    clear_buffered_question(req.session_id)
    clear_served_questions(req.session_id)
    print(f"DEBUG buffer cleared for session {req.session_id[:8]}")
    return {"status": "cleared"}


@router.get("/topics")
async def get_topics():
    questions = question_service.get_all_questions()
    domains = sorted({q.domain for q in questions})
    scenarios = sorted({q.scenario for q in questions})
    return {"domains": domains, "scenarios": scenarios}
