from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class AnswerOption(BaseModel):
    id: str
    text: str


class Question(BaseModel):
    id: str
    domain: str
    subdomain: Optional[str] = None
    scenario: str
    difficulty: DifficultyLevel
    scenario_context: str
    question: str
    options: List[AnswerOption]
    correct_answer: str
    explanation: str


class QuestionRequest(BaseModel):
    domain: Optional[str] = None
    difficulty: DifficultyLevel = DifficultyLevel.medium
    session_id: str


class QuestionResponse(BaseModel):
    id: str
    domain: str
    subdomain: Optional[str] = None
    scenario: str
    difficulty: DifficultyLevel
    scenario_context: str
    question: str
    options: List[AnswerOption]
