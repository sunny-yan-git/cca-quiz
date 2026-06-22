---
description: Start an interactive CCA-F quiz question loop in the terminal
argument-hint: "[domain] [difficulty]"
allowed-tools:
  - Bash
---

Start a CCA-F exam quiz session. Arguments from `$ARGUMENTS`:
- First token (optional): domain slug — one of `agentic-architecture`, `tool-design`, `claude-code`, `prompt-engineering`, `context-management`
- Second token (optional): difficulty — `easy`, `medium`, or `hard`

## Domain slug → full name map
| Slug | Full domain name |
|------|-----------------|
| `agentic-architecture` | Agentic Architecture & Orchestration |
| `tool-design` | Tool Design & MCP Integration |
| `claude-code` | Claude Code Configuration |
| `prompt-engineering` | Prompt Engineering & Structured Output |
| `context-management` | Context Management & Reliability |

## Step 1 — Determine target domain

Parse `$ARGUMENTS`. If a domain slug was provided, map it to the full domain name above.

If NO domain was provided, read `data/scores.json` to find the weakest domain:

```bash
cat data/scores.json
```

From the scores, compute per-domain accuracy (correct / total across all sessions). Select the domain with the lowest accuracy. If scores.json is empty or a domain has never been attempted, prefer `Agentic Architecture & Orchestration` (highest exam weight at 27%).

Announce: `Targeting domain: <full domain name>` (and `(weakest area)` if auto-selected).

## Step 2 — Fetch a question

POST to the backend to generate one question:

```bash
curl -s -X POST http://localhost:8000/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "<full domain name>", "difficulty": "<difficulty or null>", "count": 1}'
```

If the request fails (non-200 or curl error), print the error and stop.

## Step 3 — Display the question

Format the question clearly:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Domain : <topic>
Level  : <difficulty>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<question text>

  A.  <option A text>
  B.  <option B text>
  C.  <option C text>
  D.  <option D text>
```

## Step 4 — Wait for answer

Prompt the user: **Your answer (A / B / C / D):**

Accept single-letter input (case-insensitive). If the input is not A–D, prompt again.

## Step 5 — Score and explain

Compare the user's answer to `correct_answer` from the API response.

Display the result:

If correct:
```
✓ Correct!

Explanation: <explanation text>
```

If wrong:
```
✗ Incorrect. The correct answer is <correct_answer>.

Explanation: <explanation text>
```

## Step 6 — Persist the result

POST the answer record to the scores endpoint. Use a session ID of `cli-<unix-timestamp>`:

```bash
curl -s -X POST http://localhost:8000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "cli-<timestamp>",
    "timestamp": "<ISO 8601 datetime>",
    "total": 1,
    "correct": <1 if correct, else 0>,
    "score_pct": <100 or 0>,
    "answers": [{
      "question_id": "<id>",
      "topic": "<topic>",
      "selected": "<user answer>",
      "correct": "<correct_answer>",
      "is_correct": <true|false>
    }],
    "topic_filter": "<domain name>",
    "difficulty_filter": "<difficulty or null>"
  }'
```

## Step 7 — Continue prompt

Ask: **Another question? (y / n / switch)**

- `y` — loop back to Step 2 (same domain and difficulty)
- `n` — print a session summary and exit:
  ```
  Session complete: <correct> correct out of <total> (<pct>%)
  ```
- `switch` — loop back to Step 1 to re-select domain (re-parse `$ARGUMENTS` as empty so weak-domain logic runs again)
