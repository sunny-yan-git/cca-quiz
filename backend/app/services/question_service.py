import json
import uuid
from pathlib import Path
from typing import List, Optional

from app.config import settings
from app.models.question import Question
from app.models.score import QuizSession


def _data_path(filename: str) -> Path:
    return Path(settings.data_dir) / filename


def load_question_bank() -> List[dict]:
    path = _data_path("question_bank.json")
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def save_question_bank(questions: List[dict]) -> None:
    path = _data_path("question_bank.json")
    path.write_text(json.dumps(questions, indent=2, ensure_ascii=False), encoding="utf-8")


def get_topics() -> List[str]:
    bank = load_question_bank()
    return sorted({q["topic"] for q in bank})


def load_scores() -> List[dict]:
    path = _data_path("scores.json")
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def append_score(session: QuizSession) -> None:
    scores = load_scores()
    scores.append(session.model_dump())
    path = _data_path("scores.json")
    path.write_text(json.dumps(scores, indent=2, ensure_ascii=False), encoding="utf-8")


def load_focus_weights() -> Optional[dict]:
    path = _data_path("focus_weights.json")
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def assign_question_id(question: dict) -> dict:
    question["id"] = f"gen-{uuid.uuid4().hex[:8]}"
    return question
