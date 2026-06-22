---
description: Print a CCA-F performance summary from scores.json
allowed-tools:
  - Bash
  - Read
---

Read `data/scores.json` using the Read tool and print a performance summary to the terminal.

## Step 1 — Load scores

Read the file:

```
data/scores.json
```

If the file is empty (`[]`) or missing, print:

```
No quiz sessions recorded yet. Run /quiz to get started.
```

Then stop.

## Step 2 — Compute stats

From the full array of sessions, calculate:

- **Total questions answered**: sum of `total` across all sessions
- **Total correct**: sum of `correct` across all sessions
- **Overall accuracy**: `total_correct / total_questions * 100`, rounded to 1 decimal
- **Last session date**: `timestamp` of the most recent session, formatted as `YYYY-MM-DD HH:MM`
- **Per-domain accuracy**: for each unique `topic` value in all `answers` arrays, sum `is_correct` and total count across every answer record in every session

The five official CCA-F domains (use these exact names even if a domain has zero attempts):

1. Agentic Architecture & Orchestration
2. Tool Design & MCP Integration
3. Claude Code Configuration
4. Prompt Engineering & Structured Output
5. Context Management & Reliability

## Step 3 — Print the report

Print exactly this layout (fill in computed values):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CCA-F Performance Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Overall accuracy : <X.X>%  (<correct> / <total> questions)
  Last session     : <YYYY-MM-DD HH:MM>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  By Domain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓/✗  Domain                                    Accuracy   Answered
  ───  ────────────────────────────────────────  ─────────  ────────
  <✓>  Agentic Architecture & Orchestration      <X.X>%     <n>
  <✓>  Tool Design & MCP Integration             <X.X>%     <n>
  <✓>  Claude Code Configuration                 <X.X>%     <n>
  <✓>  Prompt Engineering & Structured Output    <X.X>%     <n>
  <✓>  Context Management & Reliability          <X.X>%     <n>

  ✓ = 70% or above    ✗ = below 70%
  — = not yet attempted

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠  Weakest domain: <domain name>  (<X.X>%)
     Focus here next: /quiz <slug>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Rules for the indicator column:
- `✓` — accuracy ≥ 70%
- `✗` — accuracy < 70% and at least 1 question answered
- `—` — zero questions answered for this domain

Rules for the weakest domain line:
- Only consider domains with at least 1 question answered.
- Show the domain with the lowest accuracy.
- Map the domain name to its slug for the `/quiz` hint:
  - Agentic Architecture & Orchestration → `agentic-architecture`
  - Tool Design & MCP Integration → `tool-design`
  - Claude Code Configuration → `claude-code`
  - Prompt Engineering & Structured Output → `prompt-engineering`
  - Context Management & Reliability → `context-management`
- If all domains are unattempted, omit the weakest domain block entirely.
