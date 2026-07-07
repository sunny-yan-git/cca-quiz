import json
import os
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from app.models.question import Question
from app.models.score import AnswerRequest, DomainScore, ScoresSummary, SessionScore, SubdomainScore
from app.services.claude_service import SUBDOMAINS

_DATA_DIR = Path(os.getenv("DATA_DIR", "../data"))

_question_cache: dict[str, Question] = {}

# Session-scoped question buffer: session_id → pre-generated Question
_question_buffer: dict[str, Question] = {}


def cache_question(question: Question) -> None:
    _question_cache[question.id] = question


def store_buffered_question(session_id: str, question: Question) -> None:
    """Store a pre-generated question for a session."""
    _question_buffer[session_id] = question


def get_buffered_question(session_id: str) -> Optional[Question]:
    """Retrieve and remove the buffered question for a session."""
    return _question_buffer.pop(session_id, None)


def clear_buffered_question(session_id: str) -> None:
    """Discard the buffered question when session settings change."""
    _question_buffer.pop(session_id, None)


def _path(filename: str) -> Path:
    return _DATA_DIR / filename


def get_all_questions() -> list[Question]:
    path = _path("question_bank.json")
    if not path.exists():
        return []
    raw: list[dict] = json.loads(path.read_text(encoding="utf-8"))
    return [Question(**q) for q in raw]


def get_question_by_id(question_id: str) -> Optional[Question]:
    if question_id in _question_cache:
        return _question_cache[question_id]
    return next((q for q in get_all_questions() if q.id == question_id), None)


def get_random_question(
    domain: Optional[str],
    difficulty: Optional[str],
    exclude_ids: list[str] | None = None,
    subdomain: Optional[str] = None,
) -> Optional[Question]:
    effective_domain = domain
    if effective_domain is None:
        focus_path = _path("focus.json")
        if focus_path.exists():
            focus = json.loads(focus_path.read_text(encoding="utf-8"))
            effective_domain = focus.get("domain")

    questions = get_all_questions()

    if effective_domain:
        questions = [q for q in questions if q.domain == effective_domain]
    if difficulty:
        questions = [q for q in questions if q.difficulty.value == difficulty]
    if exclude_ids:
        excluded = set(exclude_ids)
        questions = [q for q in questions if q.id not in excluded]

    if subdomain:
        subdomain_matches = [q for q in questions if q.subdomain == subdomain]
        if subdomain_matches:
            questions = subdomain_matches

    if not questions:
        return None
    return random.choice(questions)


def read_scores() -> ScoresSummary:
    path = _path("scores.json")
    records: list[dict] = []
    if path.exists():
        records = json.loads(path.read_text(encoding="utf-8"))

    # Group records by session_id
    sessions_map: dict[str, list[dict]] = {}
    for record in records:
        sid = record["session_id"]
        sessions_map.setdefault(sid, []).append(record)

    sessions: list[SessionScore] = []
    all_correct = 0
    all_total = 0
    domain_correct: dict[str, int] = {}
    domain_total: dict[str, int] = {}

    for session_id, answers in sessions_map.items():
        domain_scores: dict[str, DomainScore] = {}
        subdomain_scores: dict[str, SubdomainScore] = {}
        session_correct: dict[str, int] = {}
        session_total: dict[str, int] = {}
        session_sub_correct: dict[str, int] = {}
        session_sub_total: dict[str, int] = {}

        for a in answers:
            if not a.get("domain") or a.get("domain") not in SUBDOMAINS:
                continue
            d = a["domain"]
            session_correct[d] = session_correct.get(d, 0) + (1 if a["correct"] else 0)
            session_total[d] = session_total.get(d, 0) + 1
            domain_correct[d] = domain_correct.get(d, 0) + (1 if a["correct"] else 0)
            domain_total[d] = domain_total.get(d, 0) + 1
            all_correct += 1 if a["correct"] else 0
            all_total += 1

            sd = a.get("subdomain")
            if sd:
                session_sub_correct[sd] = session_sub_correct.get(sd, 0) + (1 if a["correct"] else 0)
                session_sub_total[sd] = session_sub_total.get(sd, 0) + 1

        for d in session_total:
            c = session_correct.get(d, 0)
            t = session_total[d]
            domain_scores[d] = DomainScore(
                domain=d,
                correct=c,
                total=t,
                accuracy=round(c / t, 4) if t else 0.0,
            )

        for sd in session_sub_total:
            c = session_sub_correct.get(sd, 0)
            t = session_sub_total[sd]
            subdomain_scores[sd] = SubdomainScore(
                subdomain=sd,
                correct=c,
                total=t,
                accuracy=round(c / t, 4) if t else 0.0,
            )

        timestamp = answers[0].get("timestamp", "")
        sessions.append(
            SessionScore(
                session_id=session_id,
                timestamp=timestamp,
                domain_scores=domain_scores,
                subdomain_scores=subdomain_scores,
                questions_answered=len(answers),
            )
        )

    domain_accuracies = {
        d: round(domain_correct[d] / domain_total[d], 4)
        for d in domain_total
        if domain_total[d] > 0
    }

    weakest_domain = (
        min(domain_accuracies, key=lambda d: domain_accuracies[d])
        if domain_accuracies
        else None
    )

    overall_accuracy = round(all_correct / all_total, 4) if all_total else 0.0

    return ScoresSummary(
        sessions=sessions,
        overall_accuracy=overall_accuracy,
        domain_accuracies=domain_accuracies,
        weakest_domain=weakest_domain,
    )


def write_answer_result(
    session_id: str, answer_request: AnswerRequest, correct: bool
) -> None:
    path = _path("scores.json")
    records: list[dict] = []
    if path.exists():
        records = json.loads(path.read_text(encoding="utf-8"))

    records.append(
        {
            "session_id": session_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "question_id": answer_request.question_id,
            "domain": answer_request.domain,
            "subdomain": answer_request.subdomain,
            "difficulty": answer_request.difficulty.value,
            "selected_answer": answer_request.selected_answer,
            "correct": correct,
        }
    )

    path.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")


def get_target_subdomain(domain: str | None) -> tuple[str | None, str | None]:
    """
    Returns (target_domain, target_subdomain) based on session history.
    Picks the least-recently-covered subdomain within the requested domain.
    If no domain specified, picks weakest domain first.
    """
    if domain and domain not in SUBDOMAINS:
        domain = None

    scores = read_scores()

    if domain is None:
        if scores.weakest_domain:
            domain = scores.weakest_domain
        else:
            domain = random.choice(list(SUBDOMAINS.keys()))

    subdomains = SUBDOMAINS.get(domain, [])
    if not subdomains:
        return domain, None

    subdomain_counts: dict[str, int] = {s: 0 for s in subdomains}
    for session in scores.sessions:
        for sd, sd_score in session.subdomain_scores.items():
            if sd in subdomain_counts:
                subdomain_counts[sd] += sd_score.total

    min_count = min(subdomain_counts.values())
    least_seen = [sd for sd, count in subdomain_counts.items() if count == min_count]

    return domain, random.choice(least_seen)


async def prefetch_next_question(
    session_id: str,
    domain: Optional[str],
    difficulty: str,
    exam_guide: str,
) -> None:
    """
    Pre-generate the next question and store in buffer.
    Called as a background task after serving each question.
    Failures are silently swallowed — buffer misses fall back
    to normal generation gracefully.
    """
    from app.services.claude_service import generate_question

    try:
        target_domain, target_subdomain = get_target_subdomain(domain)
        question = await generate_question(
            domain=target_domain,
            difficulty=difficulty,
            exam_guide_content=exam_guide,
            subdomain=target_subdomain,
        )
        if question:
            store_buffered_question(session_id, question)
            print(f"DEBUG buffer → pre-generated {question.id} for session {session_id[:8]}")
    except Exception as exc:
        print(f"DEBUG buffer prefetch failed: {exc}")
