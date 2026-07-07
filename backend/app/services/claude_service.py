import json
import os
import uuid
from pathlib import Path
from typing import Optional

import anthropic

from app.models.question import AnswerOption, DifficultyLevel, Question

_client = anthropic.AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

SUBDOMAINS: dict[str, list[str]] = {
    "agentic-architecture": [
        "1.1-agentic-loops",
        "1.2-multi-agent-orchestration",
        "1.3-subagent-context-passing",
        "1.4-workflow-enforcement",
        "1.5-agent-sdk-hooks",
        "1.6-task-decomposition",
        "1.7-session-state-resumption",
    ],
    "tool-design-mcp": [
        "2.1-tool-interface-design",
        "2.2-structured-error-responses",
        "2.3-tool-distribution-choice",
        "2.4-mcp-server-integration",
        "2.5-builtin-tools",
    ],
    "claude-code-config": [
        "3.1-claude-md-hierarchy",
        "3.2-custom-commands-skills",
        "3.3-plan-mode-direct-execution",
        "3.4-iterative-refinement",
        "3.5-ci-cd-integration",
    ],
    "prompt-engineering": [
        "4.1-structured-output-tool-use",
        "4.2-few-shot-prompting",
        "4.3-prompt-chaining",
        "4.4-false-positive-reduction",
        "4.5-extraction-patterns",
        "4.6-multi-instance-review",
    ],
    "context-management": [
        "5.1-context-window-optimization",
        "5.2-progressive-summarization",
        "5.3-prompt-caching-awareness",
        "5.4-message-batches-api",
        "5.5-confidence-scoring",
        "5.6-information-provenance",
    ],
}


def get_subdomains_for_domain(domain: str) -> list[str]:
    """Return the list of subdomain slugs for a given domain slug."""
    return SUBDOMAINS.get(domain, [])

_SYSTEM_PROMPT = """\
You are an expert question author for the Claude Certified Architect – Foundations (CCA-F) exam.

Your task is to generate exactly ONE scenario-based multiple-choice question that tests architectural judgment — not fact recall.

GROUNDING REQUIREMENT:
Every question must be grounded strictly in the official exam guide content provided below. Do not introduce concepts, tools, or patterns that are not present in the guide. Do not generate questions on out-of-scope topics listed in the guide.

SCENARIO REQUIREMENT:
Every question must be set in one of these 6 official exam scenarios:
- Customer Support Resolution Agent
- Code Generation with Claude Code
- Multi-Agent Research System
- Developer Productivity with Claude
- Claude Code for Continuous Integration
- Structured Data Extraction

Scenario contexts must describe realistic enterprise production systems — not generic academic or hobbyist topics. Use concrete production details: system names, volume metrics, SLA targets, team structures, or business constraints. Avoid generic research topics like "economic impact of X" or "study of Y" — instead ground scenarios in the operational reality of the system being built.

Good example: "Your customer support agent handles 2,000 tickets per day with a 4-hour SLA. It has access to get_customer, lookup_order, and process_refund tools. The refund tool is currently processing $180 refunds that were meant to be $18 — a decimal precision bug in the MCP tool's input schema."

Bad example: "A multi-agent research system is investigating the economic impact of remote work adoption."

QUESTION QUALITY RULES:
- Test architectural judgment and tradeoff decisions, never API parameter recall or syntax
- The correct answer must be defensible against the official exam guide
- Each distractor must represent a plausible anti-pattern that a candidate with incomplete knowledge might choose — not an obviously wrong answer
- Explain why each distractor fails, not just why the correct answer is right

OUTPUT FORMAT:
Respond with valid JSON only. No markdown fences, no preamble, no explanation outside the JSON object.

{
  "id": "gen-[8 random chars]",
  "domain": "[domain slug]",
  "subdomain": "[subdomain slug]",
  "scenario": "[scenario slug]",
  "difficulty": "[easy|medium|hard]",
  "scenario_context": "2-3 sentences describing the production context",
  "question": "The architectural decision question",
  "correct_answer": "A|B|C|D",
  "options": [
    {"id": "A", "text": "..."},
    {"id": "B", "text": "..."},
    {"id": "C", "text": "..."},
    {"id": "D", "text": "..."}
  ],
  "explanation": "Why [correct] is correct: ... Why A is wrong: ... Why B is wrong: ... Why C is wrong: ... Why D is wrong: ..."
}

Domain slugs: agentic-architecture, tool-design-mcp, claude-code-config, prompt-engineering, context-management

Scenario slugs: customer-support, code-generation, multi-agent-research, developer-productivity, ci-cd, structured-data-extraction
"""


def _parse_question(text: str) -> Optional[Question]:
    """Extract and parse a JSON Question from a model response string."""
    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.splitlines()
        stripped = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        data = json.loads(stripped)
    except json.JSONDecodeError as e:
        print(f"DEBUG JSON parse failed: {e} — response length: {len(stripped)} chars")
        print(f"DEBUG response tail: ...{stripped[-200:]}")
        return None

    try:
        data["id"] = f"gen-{uuid.uuid4().hex[:8]}"
        data["options"] = [AnswerOption(**opt) for opt in data["options"]]
        data["difficulty"] = DifficultyLevel(data["difficulty"])
        return Question(**data)
    except (KeyError, ValueError, TypeError):
        return None


async def generate_question(
    domain: str | None,
    difficulty: str,
    exam_guide_content: str,
    subdomain: str | None = None,
) -> Optional[Question]:
    generation_instruction = f"Using the exam guide above, generate one {difficulty} question."

    if domain:
        generation_instruction += f"\nTarget domain: {domain}"
    if subdomain:
        generation_instruction += (
            f"\nTarget subdomain: {subdomain} — the question must test knowledge and"
            " skills from this specific subdomain."
        )
    elif domain:
        generation_instruction += "\nChoose any subdomain within this domain."

    print(f"DEBUG generation instruction: {generation_instruction}")

    user_content = f"{exam_guide_content}\n\n---\n\n{generation_instruction}"

    async def _call() -> str:
        response = await _client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )
        print(f"DEBUG stop_reason: {response.stop_reason}, tokens used: {response.usage}")
        return response.content[0].text

    try:
        text = await _call()
    except anthropic.APIError as exc:
        raise RuntimeError(f"Anthropic API error: {exc}") from exc

    question = _parse_question(text)
    if question is not None:
        return question

    # Retry once on parse failure
    try:
        text = await _call()
    except anthropic.APIError as exc:
        raise RuntimeError(f"Anthropic API error on retry: {exc}") from exc

    return _parse_question(text)


def load_exam_guide() -> str:
    # parents[2] = backend/, so ../data/generation_guide.md = project root / data / generation_guide.md
    backend_dir = Path(__file__).parents[2]
    primary = backend_dir.parent / "data" / "generation_guide.md"
    if primary.exists():
        return primary.read_text(encoding="utf-8")

    # Fallback: cwd-relative data/generation_guide.md (covers running from project root directly)
    fallback = Path("data") / "generation_guide.md"
    if fallback.exists():
        return fallback.read_text(encoding="utf-8")

    raise FileNotFoundError(
        f"generation_guide.md not found at {primary} or {fallback.resolve()}"
    )
