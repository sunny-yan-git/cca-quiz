# CCA-F Question Generation Guide

## Domain Weights

- Domain 1: Agentic Architecture & Orchestration (27% of scored content)
- Domain 2: Tool Design & MCP Integration (18% of scored content)
- Domain 3: Claude Code Configuration & Workflows (20% of scored content)
- Domain 4: Prompt Engineering & Structured Output (20% of scored content)
- Domain 5: Context Management & Reliability (15% of scored content)

## Exam Scenarios

### Scenario 1: Customer Support Resolution Agent

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (`get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`). Your target is 80%+ first-contact resolution while knowing when to escalate.

### Scenario 2: Code Generation with Claude Code

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

### Scenario 3: Multi-Agent Research System

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

### Scenario 4: Developer Productivity with Claude

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

### Scenario 5: Claude Code for Continuous Integration

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

### Scenario 6: Structured Data Extraction

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JSON schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

---

## Domain 1: Agentic Architecture & Orchestration (27%)

### Task Statement 1.1: Design and implement agentic loops for autonomous task execution

**Knowledge of:**
- `stop_reason` drives loop: `"tool_use"` → continue; `"end_turn"` → stop.
- Tool results append to conversation history each iteration.
- Model-driven tool selection vs pre-configured decision trees.

**Skills in:**
- Loop on `"tool_use"`, terminate on `"end_turn"`.
- Append tool results before each model call.
- Avoid: NL termination signals, arbitrary caps, text-content completion checks.

### Task Statement 1.2: Orchestrate multi-agent systems with coordinator-subagent patterns

**Knowledge of:**
- Hub-and-spoke: coordinator manages all comms, errors, routing.
- Subagents have isolated context; no coordinator history inheritance.
- Coordinator: decomposition, delegation, aggregation, subagent selection.
- Narrow decomposition → incomplete topic coverage.

**Skills in:**
- Coordinator dynamically selects subagents per query requirements.
- Partition scope across subagents to minimize duplication.
- Re-delegate on coverage gaps until sufficient.
- All comms through coordinator for observability.

### Task Statement 1.3: Configure subagent invocation, context passing, and spawning

**Knowledge of:**
- `Task` tool spawns subagents; coordinator `allowedTools` must include `"Task"`.
- Subagents need explicit context; no automatic parent inheritance.
- `AgentDefinition`: descriptions, system prompts, tool restrictions per type.
- `fork_session` branches from a shared analysis baseline.

**Skills in:**
- Pass prior agent findings directly in subagent prompt.
- Separate content from metadata when passing context between agents.
- Parallel subagents: multiple `Task` calls in one coordinator response.
- Coordinator prompts: goals and quality criteria, not step-by-step procedures.

### Task Statement 1.4: Implement multi-step workflows with enforcement and handoff patterns

**Knowledge of:**
- Programmatic enforcement (hooks, gates) vs prompt guidance for ordering.
- Prompt instructions alone have non-zero failure rate for deterministic compliance.
- Handoffs include customer details, root cause, recommended actions.

**Skills in:**
- Prerequisites block downstream tools until dependencies complete.
- Parallel multi-concern investigation; synthesize unified resolution.
- Structured escalation summaries for humans without transcript access.

### Task Statement 1.5: Apply Agent SDK hooks for tool call interception and data normalization

**Knowledge of:**
- `PostToolUse` hooks transform tool results before model processing.
- Interception hooks enforce compliance on outgoing tool calls.
- Hooks: deterministic compliance; prompts: probabilistic compliance.

**Skills in:**
- `PostToolUse` normalizes heterogeneous MCP tool output formats.
- Interception blocks violations and redirects to alternative workflows.
- Hooks over prompts when guaranteed compliance is required.

### Task Statement 1.6: Design task decomposition strategies for complex workflows

**Knowledge of:**
- Prompt chaining for fixed sequential pipelines; dynamic for adaptive workflows.
- Prompt chaining: sequential focused steps per task.
- Adaptive decomposition generates subtasks from intermediate findings.

**Skills in:**
- Prompt chaining for predictable; dynamic decomposition for open-ended tasks.
- Per-file passes + cross-file integration pass for large code reviews.
- Map structure first, then build adaptive plan for open-ended tasks.

### Task Statement 1.7: Manage session state, resumption, and forking

**Knowledge of:**
- `--resume <session-name>` continues a specific named session.
- `fork_session` creates branches from a shared analysis baseline.
- Resumed sessions need file change notifications for targeted re-analysis.
- Fresh session + injected summary beats resuming stale results.

**Skills in:**
- `--resume` continues named sessions across work sessions.
- `fork_session` for parallel divergent exploration branches.
- Resume when context valid; fresh + summary when results are stale.
- Specify changed files to resumed session to skip re-exploration.

---

## Domain 2: Tool Design & MCP Integration (18%)

### Task Statement 2.1: Design effective tool interfaces with clear descriptions and boundaries

**Knowledge of:**
- Tool descriptions drive LLM selection; minimal descriptions → unreliable selection.
- Include input formats, edge cases, boundaries in descriptions.
- Overlapping descriptions cause misrouting.
- System prompt keywords can override tool descriptions.

**Skills in:**
- Differentiate purpose, inputs, outputs, and when to use vs alternatives.
- Rename tools and update descriptions to eliminate functional overlap.
- Split generic tools into purpose-specific with defined I/O contracts.
- Review system prompts for keywords overriding tool descriptions.

### Task Statement 2.2: Implement structured error responses for MCP tools

**Knowledge of:**
- MCP `isError` flag signals failure to the agent.
- Error categories: transient, validation, business, permission.
- Generic errors prevent appropriate agent recovery.
- Structured metadata distinguishes retryable from non-retryable errors.

**Skills in:**
- Return `errorCategory`, `isRetryable`, and human-readable description.
- `retriable: false` + explanation for business rule violations.
- Resolve transient locally; propagate only unresolvable with partial results.
- Distinguish access failures from valid empty results.

### Task Statement 2.3: Distribute tools appropriately across agents and configure tool choice

**Knowledge of:**
- Too many tools (e.g., 18 vs 4–5) degrades selection reliability.
- Agents misuse tools outside their specialization.
- Scope to role tools; add limited cross-role tools for frequent needs.
- `tool_choice`: `"auto"`, `"any"`, forced `{"type": "tool", "name": "..."}`.

**Skills in:**
- Restrict each subagent to role-relevant tools.
- Replace generic tools with constrained role-specific alternatives.
- Scoped cross-role tools for frequent needs; complex cases via coordinator.
- Forced `tool_choice` sequences specific tools across turns.
- `tool_choice: "any"` guarantees a tool call over a text response.

### Task Statement 2.4: Integrate MCP servers into Claude Code and agent workflows

**Knowledge of:**
- `.mcp.json` project-level for shared; `~/.claude.json` user-level for personal.
- Env var expansion in `.mcp.json` manages credentials without committing secrets.
- All MCP tools discovered at connection time, simultaneously available.
- MCP resources expose content catalogs to reduce exploratory calls.

**Skills in:**
- Shared: `.mcp.json` with env var expansion for auth tokens.
- Personal: `~/.claude.json`.
- Enhanced MCP descriptions prevent agent preference for built-in tools.
- Community servers for standard integrations; custom for team-specific.
- Content catalogs as MCP resources for visibility without exploratory calls.

### Task Statement 2.5: Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively

**Knowledge of:**
- Grep for content search across file contents.
- Glob for file path pattern matching.
- Read/Write: full file ops; Edit: targeted unique-text modifications.
- Read + Write fallback when Edit fails on non-unique anchor text.

**Skills in:**
- Grep for content search; Glob for file name pattern matching.
- Fall back to Read + Write when Edit fails on non-unique text.
- Grep entry points, then Read to trace flows for incremental understanding.
- Find exported names then search each across the codebase to trace usage.

---

## Domain 3: Claude Code Configuration & Workflows (20%)

### Task Statement 3.1: Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization

**Knowledge of:**
- CLAUDE.md hierarchy: user `~/.claude/CLAUDE.md`, project-level, directory-level.
- User-level not version-controlled; teammates don't receive it.
- `@import` references external files for modular organization.
- `.claude/rules/` for topic-specific files vs monolithic CLAUDE.md.

**Skills in:**
- Diagnose hierarchy issues (user-level vs project-level placement).
- `@import` for selective per-package standards inclusion.
- Split large CLAUDE.md into topic files in `.claude/rules/`.
- `/memory` to verify loaded files and diagnose inconsistent behavior.

### Task Statement 3.2: Create and configure custom slash commands and skills

**Knowledge of:**
- `.claude/commands/`: project-scoped (VCS-shared); `~/.claude/commands/`: personal.
- `SKILL.md` frontmatter: `context: fork`, `allowed-tools`, `argument-hint`.
- `context: fork` isolates skill in sub-agent, preventing conversation pollution.
- Personal variants in `~/.claude/skills/` avoid teammate impact.

**Skills in:**
- Project commands in `.claude/commands/` for team-wide VCS availability.
- `context: fork` isolates verbose or exploratory skills from main session.
- `allowed-tools` restricts tool access during skill execution.
- `argument-hint` prompts for params when invoked without arguments.
- Skills for on-demand tasks; CLAUDE.md for always-loaded universal standards.

### Task Statement 3.3: Apply path-specific rules for conditional convention loading

**Knowledge of:**
- `.claude/rules/` YAML `paths` glob patterns activate rules conditionally.
- Path-scoped rules load only for matching files.
- Glob rules beat directory CLAUDE.md for cross-directory conventions.

**Skills in:**
- YAML `paths` frontmatter in `.claude/rules/` for file-matched activation.
- Glob patterns for type-based conventions regardless of directory.
- Path rules over subdirectory CLAUDE.md for codebase-spanning conventions.

### Task Statement 3.4: Determine when to use plan mode vs direct execution

**Knowledge of:**
- Plan mode for complex, multi-approach, large-scale, or architectural tasks.
- Direct execution for simple, well-scoped, single-file changes.
- Plan mode: safe exploration before committing, prevents costly rework.
- Explore subagent isolates verbose discovery output, returns summaries.

**Skills in:**
- Plan mode for architectural, multi-file, or high-ambiguity tasks.
- Direct execution for clear-scope single-file changes.
- Explore subagent for verbose discovery to prevent context exhaustion.
- Plan mode for investigation; direct execution for implementation.

### Task Statement 3.5: Apply iterative refinement techniques for progressive improvement

**Knowledge of:**
- Input/output examples most effectively communicate expected transformations.
- Test-driven iteration: tests first, then iterate on failures.
- Interview pattern: Claude surfaces design considerations pre-implementation.
- Bundle interacting issues in one message; sequential for independent ones.

**Skills in:**
- 2–3 I/O examples when prose descriptions produce inconsistent results.
- Write tests first; iterate by sharing test failures.
- Interview pattern in unfamiliar domains to surface design considerations.
- Specific I/O test cases to guide edge case fixes.
- Bundle interacting issues; sequential for independent ones.

### Task Statement 3.6: Integrate Claude Code into CI/CD pipelines

**Knowledge of:**
- `-p` / `--print` runs Claude Code non-interactively in CI.
- `--output-format json` + `--json-schema` enforce structured CI output.
- CLAUDE.md provides project context to CI-invoked Claude Code.
- Independent review sessions outperform same-session self-review.

**Skills in:**
- `-p` flag prevents interactive hangs in CI.
- `--output-format json` + `--json-schema` for machine-parseable PR findings.
- Prior review context → report only new or unaddressed issues.
- Existing tests in context → prevent duplicate test generation.
- Testing standards + fixtures in CLAUDE.md improve generation quality.

---

## Domain 4: Prompt Engineering & Structured Output (20%)

### Task Statement 4.1: Design prompts with explicit criteria to improve precision and reduce false positives

**Knowledge of:**
- Explicit criteria outperform vague instructions for review precision.
- "Be conservative" doesn't improve precision; categorical criteria do.
- High FP rate in any category undermines trust across all categories.

**Skills in:**
- Define report vs skip categories explicitly rather than by confidence filtering.
- Disable high-FP categories temporarily while refining prompts.
- Severity criteria with concrete code examples per level for consistency.

### Task Statement 4.2: Apply few-shot prompting to improve output consistency and quality

**Knowledge of:**
- Few-shot examples achieve consistent output when instructions alone fail.
- Few-shot demonstrates how to handle ambiguous cases.
- Few-shot enables generalization to novel patterns beyond specified cases.
- Few-shot reduces hallucination in extraction with varied document structures.

**Skills in:**
- 2–4 few-shot examples for ambiguous scenarios showing decision reasoning.
- Examples demonstrating exact desired output format.
- Examples distinguishing acceptable patterns from genuine issues.
- Examples for varied document structures (inline citations vs bibliographies).
- Examples for correct extraction from varied document formats.

### Task Statement 4.3: Enforce structured output using tool use and JSON schemas

**Knowledge of:**
- `tool_use` + JSON schema eliminates syntax errors; guarantees compliant output.
- `"auto"` may skip; `"any"` forces a call; forced = specific named tool required.
- JSON schemas eliminate syntax errors, not semantic errors.
- Schema: required vs optional; enum + `"other"` + detail for extensibility.

**Skills in:**
- Define extraction tool with JSON schema; parse from `tool_use` response.
- `tool_choice: "any"` when document type unknown to guarantee structured output.
- Forced `tool_choice: {"type": "tool", "name": "..."}` to sequence extractions.
- Optional/nullable schema fields when source may not contain the information.
- `"unclear"` for ambiguous enums; `"other"` + detail for extensible fields.
- Format normalization rules in prompts alongside strict output schemas.

### Task Statement 4.4: Implement validation, retry, and feedback loops for extraction quality

**Knowledge of:**
- Retry-with-feedback: append specific validation errors to guide correction.
- Retry is ineffective when data is absent from the source document.
- `detected_pattern` fields enable systematic false positive analysis.
- Semantic errors differ from syntax errors (eliminated by `tool_use`).

**Skills in:**
- Retry includes original doc, failed extraction, and specific validation errors.
- Identify retry-ineffective (absent data) vs effective (format/structure errors).
- `detected_pattern` fields in findings for FP pattern analysis.
- Self-correction: `"calculated_total"` vs `"stated_total"`; `"conflict_detected"` flags.

### Task Statement 4.5: Design efficient batch processing strategies

**Knowledge of:**
- Message Batches API: 50% savings, ≤24h processing, no latency SLA.
- Batch for latency-tolerant workloads; avoid for blocking workflows.
- Batch does not support multi-turn tool calling within a single request.
- `custom_id` correlates batch request/response pairs.

**Skills in:**
- Sync API for blocking; batch API for overnight or periodic workloads.
- Batch submission frequency must satisfy SLA given 24h processing window.
- Resubmit only failed docs by `custom_id` with modifications.
- Prompt refinement on sample set before large batch submissions.

### Task Statement 4.6: Design multi-instance and multi-pass review architectures

**Knowledge of:**
- Self-review: model retains generation context; rarely questions own decisions.
- Independent instances catch more issues than self-review or extended thinking.
- Multi-pass: per-file local passes + separate cross-file integration passes.

**Skills in:**
- Independent Claude instance for review without generator's reasoning context.
- Per-file passes + cross-file integration pass for large reviews.
- Model self-reports confidence per finding for calibrated review routing.

---

## Domain 5: Context Management & Reliability (15%)

### Task Statement 5.1: Manage conversation context to preserve critical information across long interactions

**Knowledge of:**
- Progressive summarization loses exact numbers, dates, stated expectations.
- Lost-in-the-middle: start/end reliable; middle content may be missed.
- Tool results accumulate tokens disproportionate to their relevance.
- Complete conversation history required each request for coherence.

**Skills in:**
- Extract transactional facts into persistent block outside summarized history.
- Persist structured issue data in separate context layer for multi-issue sessions.
- Trim verbose tool outputs to relevant fields before they accumulate.
- Key summaries at input start + section headers mitigate position effects.
- Require subagents to include metadata in structured outputs.
- Upstream agents return structured key data instead of verbose reasoning.

### Task Statement 5.2: Design effective escalation and ambiguity resolution patterns

**Knowledge of:**
- Escalate on explicit request, policy gaps, or inability to make progress.
- Honor explicit escalation immediately; offer resolution for straightforward issues.
- Sentiment and self-reported confidence are unreliable escalation proxies.
- Multiple customer matches → request additional identifiers, not heuristics.

**Skills in:**
- Explicit escalation criteria + few-shot examples in system prompt.
- Honor human-agent requests immediately without first investigating.
- Acknowledge frustration, offer resolution; escalate only if reiterated.
- Escalate when policy is silent or ambiguous on the specific request.
- Request additional identifiers when multiple customer matches returned.

### Task Statement 5.3: Implement error propagation strategies across multi-agent systems

**Knowledge of:**
- Structured error context (type, query, partials, alternatives) enables coordinator recovery.
- Access failures vs valid empty results must be distinguished.
- Generic error statuses hide recovery context from coordinator.
- Anti-patterns: suppress errors as success; terminate workflow on single failure.

**Skills in:**
- Structured errors: failure type, attempted query, partial results, alternatives.
- Distinguish access failures from valid empty results in subagent reporting.
- Resolve transient errors locally; propagate only unresolvable with partial results.
- Coverage annotations in synthesis for gaps from unavailable sources.

### Task Statement 5.4: Manage context effectively in large codebase exploration

**Knowledge of:**
- Long sessions: context degrades, inconsistent answers, generic references.
- Scratchpad files persist findings across context boundaries.
- Subagent delegation isolates verbose exploration from main coordination.
- Crash recovery: state exports to known location; coordinator loads manifest.

**Skills in:**
- Spawn subagents for specific investigations; main agent coordinates.
- Agents maintain scratchpad files to counteract context degradation.
- Summarize phase findings before spawning next-phase subagents.
- Crash recovery via agent state manifests loaded by coordinator on resume.
- `/compact` during verbose extended sessions to reduce context usage.

### Task Statement 5.5: Design human review workflows and confidence calibration

**Knowledge of:**
- Aggregate accuracy masks poor performance on specific document types or fields.
- Stratified random sampling measures error rates in high-confidence extractions.
- Field-level confidence calibrated with labeled validation sets guides routing.
- Validate by document type and field before automating high-confidence extractions.

**Skills in:**
- Stratified sampling of high-confidence extractions for ongoing error measurement.
- Accuracy by document type and field before reducing human review.
- Field-level confidence scores; calibrate thresholds with labeled validation sets.
- Route low-confidence or ambiguous extractions to human review.

### Task Statement 5.6: Preserve information provenance and handle uncertainty in multi-source synthesis

**Knowledge of:**
- Summarization loses attribution without explicit claim-source mappings.
- Synthesis agents must preserve and merge claim-source mappings.
- Conflicting statistics: annotate with source attribution, not pick one.
- Publication/collection dates prevent temporal differences appearing as contradictions.

**Skills in:**
- Subagents output claim-source mappings preserved through synthesis.
- Reports distinguish well-established from contested findings.
- Conflicting values annotated; coordinator reconciles before synthesis.
- Publication/collection dates in subagent outputs for temporal interpretation.
- Render appropriately: financial as tables, news as prose, technical as lists.

---

## In-Scope Topics

- Agentic loop implementation: control flow based on `stop_reason`, tool result handling, loop termination conditions
- Multi-agent orchestration: coordinator-subagent patterns, task decomposition, parallel subagent execution, iterative refinement loops
- Subagent context management: explicit context passing, structured state persistence, crash recovery using manifests
- Tool interface design: writing effective tool descriptions, splitting vs consolidating tools, tool naming to reduce ambiguity
- MCP tool and resource design: resources for content catalogs, tools for actions, description quality for adoption
- MCP server configuration: project vs user scope, environment variable expansion, multi-server simultaneous access
- Error handling and propagation: structured error responses, transient vs business vs permission errors, local recovery before escalation
- Escalation decision-making: explicit criteria, honoring customer preferences, policy gap identification
- CLAUDE.md configuration: hierarchy (user/project/directory), `@import` patterns, `.claude/rules/` with glob patterns
- Custom commands and skills: project vs user scope, `context: fork`, `allowed-tools`, `argument-hint` frontmatter
- Plan mode vs direct execution: complexity assessment, architectural decisions, single-file changes
- Iterative refinement: input/output examples, test-driven iteration, interview pattern, sequential vs parallel issue resolution
- Structured output via `tool_use`: schema design, `tool_choice` configuration, nullable fields to prevent hallucination
- Few-shot prompting: ambiguous scenario targeting, format consistency, false positive reduction
- Batch processing: Message Batches API appropriateness, latency tolerance assessment, failure handling by `custom_id`
- Context window optimization: trimming verbose tool outputs, structured fact extraction, position-aware input ordering
- Human review workflows: confidence calibration, stratified sampling, accuracy segmentation by document type and field
- Information provenance: claim-source mappings, temporal data handling, conflict annotation, coverage gap reporting

## Out-of-Scope Topics

- Fine-tuning Claude models or training custom models
- Claude API authentication, billing, or account management
- Detailed implementation of specific programming languages or frameworks
- Deploying or hosting MCP servers (infrastructure, networking, container orchestration)
- Claude's internal architecture, training process, or model weights
- Constitutional AI, RLHF, or safety training methodologies
- Embedding models or vector database implementation details
- Computer use (browser automation, desktop interaction)
- Vision/image analysis capabilities
- Streaming API implementation or server-sent events
- Rate limiting, quotas, or API pricing calculations
- OAuth, API key rotation, or authentication protocol details
- Specific cloud provider configurations (AWS, GCP, Azure)
- Performance benchmarking or model comparison metrics
- Prompt caching implementation details (beyond knowing it exists)
- Token counting algorithms or tokenization specifics

## Technologies and Concepts

- **Claude Agent SDK** — Agent definitions, agentic loops, `stop_reason` handling, hooks (`PostToolUse`, tool call interception), subagent spawning via `Task` tool, `allowedTools` configuration
- **Model Context Protocol (MCP)** — MCP servers, MCP tools, MCP resources, `isError` flag, tool descriptions, tool distribution, `.mcp.json` configuration, environment variable expansion
- **Claude Code** — CLAUDE.md configuration hierarchy (user/project/directory), `.claude/rules/` with YAML frontmatter path-scoping, `.claude/commands/` for slash commands, `.claude/skills/` with SKILL.md frontmatter (`context: fork`, `allowed-tools`, `argument-hint`), plan mode, direct execution, `/memory` command, `/compact`, `--resume`, `fork_session`, Explore subagent
- **Claude Code CLI** — `-p` / `--print` flag for non-interactive mode, `--output-format json`, `--json-schema` for structured CI output
- **Claude API** — `tool_use` with JSON schemas, `tool_choice` options (`"auto"`, `"any"`, forced tool selection), `stop_reason` values (`"tool_use"`, `"end_turn"`), `max_tokens`, system prompts
- **Message Batches API** — 50% cost savings, up to 24-hour processing window, `custom_id` for request/response correlation, polling for completion, no multi-turn tool calling support
- **JSON Schema** — Required vs optional fields, enum types, nullable fields, `"other"` + detail string patterns, strict mode for syntax error elimination
- **Pydantic** — Schema validation, semantic validation errors, validation-retry loops
- **Built-in tools** — Read, Write, Edit, Bash, Grep, Glob — their purposes and selection criteria
- **Few-shot prompting** — Targeted examples for ambiguous scenarios, format demonstration, generalization to novel patterns
- **Prompt chaining** — Sequential task decomposition into focused passes
- **Context window management** — Token budgets, progressive summarization, lost-in-the-middle effects, context extraction, scratchpad files
- **Session management** — Session resumption, `fork_session`, named sessions, session context isolation
- **Confidence scoring** — Field-level confidence, calibration with labeled validation sets, stratified sampling for error rate measurement
