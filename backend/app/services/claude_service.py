import json
import uuid
from typing import List, Optional

import anthropic

from app.config import settings
from app.models.question import Difficulty

_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

_QUESTION_TOOL = {
    "name": "return_questions",
    "description": "Return a list of generated multiple-choice exam questions.",
    "input_schema": {
        "type": "object",
        "properties": {
            "questions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["topic", "difficulty", "question", "options", "correct_answer", "explanation"],
                    "properties": {
                        "topic": {"type": "string"},
                        "difficulty": {"type": "string", "enum": ["easy", "medium", "hard"]},
                        "question": {"type": "string"},
                        "options": {
                            "type": "array",
                            "minItems": 4,
                            "maxItems": 4,
                            "items": {
                                "type": "object",
                                "required": ["id", "text"],
                                "properties": {
                                    "id": {"type": "string", "enum": ["A", "B", "C", "D"]},
                                    "text": {"type": "string"},
                                },
                            },
                        },
                        "correct_answer": {"type": "string", "enum": ["A", "B", "C", "D"]},
                        "explanation": {"type": "string"},
                    },
                },
            }
        },
        "required": ["questions"],
    },
}

_SYSTEM_PROMPT = """You are a CCA-F (Claude Certified Architect – Foundations) exam question writer.

CCA-F domains:
1. Claude Model Capabilities & Limitations
2. Prompt Engineering & Context Management
3. Claude API & SDK Integration
4. Safety, Alignment & Constitutional AI
5. Multi-agent Systems & Tool Use
6. Responsible AI Deployment & Ethics

Rules for questions:
- Each question must be unambiguous with exactly one correct answer.
- Distractors (wrong options) should be plausible but clearly incorrect to a well-prepared candidate.
- Explanations must explain WHY the correct answer is right AND why the main distractor is wrong.
- Questions should test understanding, not trivia memorization.
- Use realistic architect-level scenarios where possible.
"""


async def generate_questions(
    count: int,
    topic: Optional[str],
    difficulty: Optional[Difficulty],
    topic_weights: Optional[dict] = None,
) -> List[dict]:
    topic_instruction = f"Focus exclusively on the topic: {topic}." if topic else "Mix questions across all six CCA-F domains."
    difficulty_instruction = f"All questions must be {difficulty.value} difficulty." if difficulty else "Mix easy, medium, and hard difficulties."

    weight_instruction = ""
    if topic_weights:
        low_topics = [t for t, w in topic_weights.items() if w > 1.0]
        if low_topics:
            weight_instruction = f"Prioritize these weak-area topics: {', '.join(low_topics)}."

    user_message = (
        f"Generate exactly {count} multiple-choice questions for the CCA-F exam.\n"
        f"{topic_instruction}\n"
        f"{difficulty_instruction}\n"
        f"{weight_instruction}\n"
        "Call the return_questions tool with your response."
    )

    try:
        response = await _client.messages.create(
            model=settings.model,
            max_tokens=4096,
            system=_SYSTEM_PROMPT,
            tools=[_QUESTION_TOOL],
            tool_choice={"type": "tool", "name": "return_questions"},
            messages=[{"role": "user", "content": user_message}],
        )
    except anthropic.APIError as exc:
        raise RuntimeError(f"Anthropic API error: {exc}") from exc

    tool_block = next(
        (block for block in response.content if block.type == "tool_use"),
        None,
    )
    if tool_block is None:
        raise RuntimeError("Claude did not return a tool_use block.")

    raw_questions: List[dict] = tool_block.input.get("questions", [])
    for q in raw_questions:
        q["id"] = f"gen-{uuid.uuid4().hex[:8]}"

    return raw_questions
