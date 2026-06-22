from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class AnswerOption(BaseModel):
    id: str
    text: str


class Question(BaseModel):
    id: str
    topic: str
    difficulty: Difficulty
    question: str
    options: List[AnswerOption]
    correct_answer: str
    explanation: str


class QuizRequest(BaseModel):
    topic: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    count: int = 10
    use_weights: bool = False
