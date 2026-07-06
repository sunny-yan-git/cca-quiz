# CCA-F Exam Domain Reference

This rule is always active. When generating questions, validating content, or discussing exam topics, refer to these domains and their key concepts.

## Domain 1 — Agentic Architecture & Orchestration (27%)
- Agent loop patterns: ReAct, plan-and-execute, reflection loops
- Orchestrator vs subagent roles; trust boundaries between agents
- Parallel vs sequential subagent execution
- Human-in-the-loop checkpoints and approval gates
- Error handling and retry strategies in agent pipelines
- Computer use and browser automation agents
- Agent state management and memory across turns

## Domain 2 — Tool Design & MCP Integration (18%)
- Tool definitions: name, description, input_schema best practices
- Forcing specific tool calls (`tool_choice`)
- Parallel tool calls: returning multiple `tool_use` blocks
- `tool_result` structure and returning errors to the model
- Model Context Protocol (MCP): servers, resources, prompts, tools
- MCP transport types (stdio, SSE) and client configuration
- Designing tools for reliability: schema precision, idempotency

## Domain 3 — Claude Code Configuration (20%)
- CLAUDE.md: purpose, location hierarchy (repo root, subdir, home)
- `.claude/rules/` and `.claude/commands/` conventions
- `.claude/skills/` directory: SKILL.md frontmatter options (`context: fork`, `allowed-tools`, `argument-hint`); distinction between skills (autonomous invocation) and slash commands (user-invoked)
- Custom slash commands: `$ARGUMENTS`, prompt templating
- Hooks: pre-tool-call, post-tool-call, notification events
- Settings files: `settings.json` vs `settings.local.json`, permission config
- Claude Code CLI flags: `-p`/`--print` for non-interactive mode, `--output-format json`, `--json-schema` for structured CI output; environment variable overrides
- MCP server configuration in Claude Code settings

## Domain 4 — Prompt Engineering & Structured Output (20%)
- System prompt vs human turn responsibilities
- XML tags for structural clarity (`<context>`, `<instructions>`, `<example>`)
- Few-shot and chain-of-thought prompting
- Role prompting and persona assignment
- Forcing structured output via tool use and `response_format`
- Prompt injection risks and mitigation (delimiters, explicit instructions)
- Iterative refinement: self-critique and revision patterns
- Confidence scoring: field-level confidence scores, calibration with labeled validation sets, stratified sampling for error rate measurement

## Domain 5 — Context Management & Reliability (15%)
- Context window sizes by model tier (Haiku, Sonnet, Opus)
- Prompt caching: awareness of `cache_control` breakpoints, TTL, and cache hit pricing (implementation details out of scope)
- Conversation history truncation and summarization strategies
- Message Batches API: 50% cost savings, up to 24-hour processing window, `custom_id` for request/response correlation, no multi-turn tool calling support
- Handling API errors: retries, exponential backoff, rate limits
