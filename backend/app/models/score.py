from pydantic import BaseModel
from typing import List, Optional


class AnswerRecord(BaseModel):
    question_id: str
    topic: str
    selected: str
    correct: str
    is_correct: bool


class QuizSession(BaseModel):
    session_id: str
    timestamp: str
    total: int
    correct: int
    score_pct: float
    answers: List[AnswerRecord]
    topic_filter: Optional[str] = None
    difficulty_filter: Optional[str] = None
