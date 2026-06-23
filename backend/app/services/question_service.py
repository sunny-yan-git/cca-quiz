import json
import os
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from app.models.question import Question
from app.models.score import AnswerRequest, DomainScore, ScoresSummary, SessionScore

_DATA_DIR = Path(os.getenv("DATA_DIR", "../data"))


def _path(filename: str) -> Path:
    return _DATA_DIR / filename


def get_all_questions() -> list[Question]:
    path = _path("question_bank.json")
    if not path.exists():
        return []
    raw: list[dict] = json.loads(path.read_text(encoding="utf-8"))
    return [Question(**q) for q in raw]


def get_question_by_id(question_id: str) -> Optional[Question]:
    for q in get_all_questions():
        if q.id == question_id:
            return q
    return None


def get_random_question(
    domain: Optional[str], difficulty: Optional[str]
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
        session_correct: dict[str, int] = {}
        session_total: dict[str, int] = {}

        for a in answers:
            d = a["domain"]
            session_correct[d] = session_correct.get(d, 0) + (1 if a["correct"] else 0)
            session_total[d] = session_total.get(d, 0) + 1
            domain_correct[d] = domain_correct.get(d, 0) + (1 if a["correct"] else 0)
            domain_total[d] = domain_total.get(d, 0) + 1
            all_correct += 1 if a["correct"] else 0
            all_total += 1

        for d in session_total:
            c = session_correct.get(d, 0)
            t = session_total[d]
            domain_scores[d] = DomainScore(
                domain=d,
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
            "difficulty": answer_request.difficulty.value,
            "selected_answer": answer_request.selected_answer,
            "correct": correct,
        }
    )

    path.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")
