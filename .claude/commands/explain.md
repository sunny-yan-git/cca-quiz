---
description: Deep-dive explanation of any CCA-F exam concept with code examples and exam tips
argument-hint: "[concept]"
allowed-tools:
  - Read
---

Explain the CCA-F exam concept passed as `$ARGUMENTS`.

## Step 1 — Load domain context

Read `.claude/rules/exam-content.md` using the Read tool. Use the five domains and their listed subdomains to:
- Identify which domain(s) the concept belongs to
- Ensure the explanation is scoped to what the CCA-F exam actually tests

If `$ARGUMENTS` is empty, print:

```
Usage: /explain <concept>

Examples:
  /explain stop_reason
  /explain MCP isError field
  /explain prompt caching cache_control
  /explain tool_choice any vs auto
  /explain CLAUDE.md hierarchy
  /explain parallel tool calls
```

Then stop.

## Step 2 — Identify the concept

Use `$ARGUMENTS` verbatim as the concept name. Do not correct or normalise it — if the user wrote `stop_reason handling`, explain that exactly.

Determine the primary domain from the exam-content.md subdomains. If the concept spans multiple domains, note both but anchor the explanation in the most relevant one.

## Step 3 — Write the explanation

Structure the output as follows, using these exact section headers:

---

### `<concept name>`
**Domain:** `<domain name>` (<weight>%)

---

**What it is**

Plain-English definition in 2–4 sentences. Assume the reader understands APIs and software development but may not know this specific Claude concept. No jargon without definition.

---

**Why it matters for the exam**

1–3 bullet points on why this concept appears on the CCA-F. Focus on the decision a practising architect would make, not trivia. If the concept has a weight-bearing domain (e.g. 27% Agentic Architecture), call that out.

---

**How it works**

Technical depth sufficient to answer an exam question. Include:
- The relevant API field names, types, and allowed values where applicable
- Sequencing or state transitions if the concept is procedural
- Interaction with other concepts when that is part of what the exam tests

If a code example would make the behaviour concrete, include one:

```python
# or appropriate language — use Python for Anthropic SDK examples
```

Keep examples minimal — show only what illustrates the concept, nothing else.

---

**Common misconceptions & anti-patterns**

2–4 bullet points. Frame each as a wrong belief followed by the correct behaviour:
- ✗ *Wrong belief or common mistake*
- ✓ *What is actually true*

These should directly address the kinds of traps that appear as plausible-but-wrong answer options on the exam.

---

**Study next**

Suggest exactly 2 related concepts worth studying, each with the `/explain` command the user can run:

```
Related concepts:
  /explain <concept 1>
  /explain <concept 2>
```

Choose concepts that are frequently tested alongside this one or that share a domain boundary with it.

---

## Output guidelines

- Write in second person ("you", "your agent") — the user is the architect.
- Do not add sections beyond the five above.
- Do not hedge with phrases like "it's worth noting" or "generally speaking" — be direct.
- If the concept does not appear in any CCA-F domain, say so clearly and stop rather than inventing exam relevance.
