---
description: Set the focus domain written to data/focus.json for the next quiz session
argument-hint: "[domain]"
allowed-tools:
  - Bash
  - Read
  - Write
---

Set or clear the active focus domain used by `/quiz` when no domain argument is passed.

## Valid domain slugs

| Slug | Full domain name | Exam weight |
|------|-----------------|-------------|
| `agentic-architecture` | Agentic Architecture & Orchestration | 27% |
| `tool-design` | Tool Design & MCP Integration | 22% |
| `claude-code` | Claude Code Configuration | 18% |
| `prompt-engineering` | Prompt Engineering & Structured Output | 20% |
| `context-management` | Context Management & Reliability | 13% |

---

## Step 1 — Check argument

Parse `$ARGUMENTS` for a single domain slug.

### If NO argument was provided

Read the current `data/focus.json` using the Read tool (it may not exist yet — that is fine, treat as no focus set).

Print the valid options table above, then show the current state:

```
No domain argument given. Pass one of the slugs above, e.g.:

  /focus tool-design

Current focus: <slug from focus.json, or "none">
```

Then stop — do not write anything.

---

### If an argument WAS provided

#### Step 2 — Validate the slug

Check the argument against the five valid slugs in the table above (case-insensitive).

If the slug is not recognised, print:

```
Unknown domain: "<argument>"

Valid slugs:
  agentic-architecture
  tool-design
  claude-code
  prompt-engineering
  context-management
```

Then stop — do not write anything.

#### Step 3 — Write data/focus.json

Write the following JSON to `data/focus.json` (create or overwrite):

```json
{
  "focus_domain": "<validated slug>"
}
```

Use the Write tool to write the file directly.

#### Step 4 — Confirm

Map the slug back to its full name using the table above, then print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Focus set: <full domain name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Your next /quiz session (with no domain argument)
  will target this domain automatically.

  To clear the focus:   delete data/focus.json
  To quiz right now:    /quiz <slug>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
