import json
import os
import uuid
from pathlib import Path
from typing import Optional

import anthropic

from app.models.question import AnswerOption, DifficultyLevel, Question

_client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

_MODEL = "claude-sonnet-4-6"

_SYSTEM_PROMPT = """\
You are a CCA-F (Claude Certified Architect – Foundations) exam question writer.

Your output must be a single valid JSON object — no markdown, no prose, no code fences.
The JSON must match this exact schema:

{
  "domain": "<one of the five CCA-F domain names>",
  "scenario": "<short snake_case scenario label, e.g. multi-agent-research>",
  "difficulty": "<easy | medium | hard>",
  "scenario_context": "<2–4 sentence paragraph setting up the scenario>",
  "question": "<the question stem>",
  "options": [
    {"id": "A", "text": "<option text>"},
    {"id": "B", "text": "<option text>"},
    {"id": "C", "text": "<option text>"},
    {"id": "D", "text": "<option text>"}
  ],
  "correct_answer": "<A | B | C | D>",
  "explanation": "<why the correct answer is right AND why the main distractor is wrong>"
}

Rules:
- Exactly one correct answer; distractors must be plausible but clearly wrong to a prepared candidate.
- Explanations must address both the correct answer and the strongest distractor.
- Questions test architectural understanding and judgment, not trivia memorization.
- Ground every question in the exam guide content provided in the user message.
"""


def _parse_question(text: str) -> Optional[Question]:
    """Extract and parse a JSON Question from a model response string."""
    # Strip optional markdown code fences
    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.splitlines()
        stripped = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        data = json.loads(stripped)
    except json.JSONDecodeError:
        return None

    try:
        data["id"] = f"gen-{uuid.uuid4().hex[:8]}"
        data["options"] = [AnswerOption(**opt) for opt in data["options"]]
        data["difficulty"] = DifficultyLevel(data["difficulty"])
        return Question(**data)
    except (KeyError, ValueError, TypeError):
        return None


async def _call_claude(user_message: str) -> str:
    response = await _client.messages.create(
        model=_MODEL,
        max_tokens=1000,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text


async def generate_question(
    domain: Optional[str],
    difficulty: str,
    exam_guide_content: str,
) -> Optional[Question]:
    domain_line = (
        f"Domain: {domain}" if domain else "Choose the domain most appropriate for variety."
    )
    user_message = (
        f"{domain_line}\n"
        f"Difficulty: {difficulty}\n\n"
        f"<exam_guide>\n{exam_guide_content}\n</exam_guide>\n\n"
        "Generate one CCA-F exam question. Return only the JSON object."
    )

    try:
        text = await _call_claude(user_message)
    except anthropic.APIError as exc:
        raise RuntimeError(f"Anthropic API error: {exc}") from exc

    question = _parse_question(text)
    if question is not None:
        return question

    # Retry once on parse failure
    try:
        text = await _call_claude(user_message)
    except anthropic.APIError as exc:
        raise RuntimeError(f"Anthropic API error on retry: {exc}") from exc

    return _parse_question(text)


def load_exam_guide() -> str:
    path = Path(__file__).parents[3] / ".claude" / "rules" / "exam-content.md"
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")
