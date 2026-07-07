from typing import Dict, List, Optional

from pydantic import BaseModel

from app.models.question import DifficultyLevel


class AnswerRequest(BaseModel):
    question_id: str
    session_id: str
    selected_answer: str
    domain: Optional[str] = None
    subdomain: Optional[str] = None
    difficulty: DifficultyLevel


class AnswerResult(BaseModel):
    correct: bool
    correct_answer: str
    explanation: str
    domain: str


class DomainScore(BaseModel):
    domain: str
    correct: int
    total: int
    accuracy: float


class SubdomainScore(BaseModel):
    subdomain: str
    correct: int
    total: int
    accuracy: float


class SessionScore(BaseModel):
    session_id: str
    timestamp: str
    domain_scores: Dict[str, DomainScore]
    subdomain_scores: Dict[str, SubdomainScore] = {}
    questions_answered: int


class ScoresSummary(BaseModel):
    sessions: List[SessionScore]
    overall_accuracy: float
    domain_accuracies: Dict[str, float]
    weakest_domain: Optional[str] = None
