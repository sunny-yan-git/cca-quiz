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
- Task tool as the mechanism for spawning subagents; `allowedTools` must include `"Task"` for a coordinator to invoke subagents
- Subagents do not inherit parent context automatically — context must be explicitly provided in the subagent prompt
- Agent SDK hooks: `PostToolUse` hooks for intercepting and transforming tool results; tool call interception hooks for blocking policy-violating actions (e.g. refunds above a threshold)
- Distinction between hooks (deterministic guarantees) vs prompt instructions (probabilistic compliance)
- Session forking: `fork_session` for branching from a shared baseline; named session resumption with `--resume <session-name>`

## Domain 2 — Tool Design & MCP Integration (22%)
- Tool definitions: name, description, input_schema best practices
- Forcing specific tool calls (`tool_choice`)
- Parallel tool calls: returning multiple `tool_use` blocks
- `tool_result` structure and returning errors to the model
- Model Context Protocol (MCP): servers, resources, prompts, tools
- MCP transport types (stdio, SSE) and client configuration
- Designing tools for reliability: schema precision, idempotency
- Tool overload anti-pattern: giving an agent too many tools (e.g. 18 vs 4–5 focused tools) degrades tool selection reliability
- Agents with tools outside their specialization tend to misuse them
- Scoped tool access: give each agent only the tools needed for its specific role

## Domain 3 — Claude Code Configuration (18%)
- CLAUDE.md: purpose, location hierarchy (repo root, subdir, home)
- `.claude/rules/` and `.claude/commands/` conventions
- Custom slash commands: `$ARGUMENTS`, prompt templating
- Hooks: pre-tool-call, post-tool-call, notification events
- Settings files: `settings.json` vs `settings.local.json`, permission config
- Claude Code CLI flags and environment variable overrides
- MCP server configuration in Claude Code settings
- `@import` syntax in CLAUDE.md for referencing external files to keep configuration modular
- `/memory` command for verifying which memory files are loaded in a session

## Domain 4 — Prompt Engineering & Structured Output (20%)
- System prompt vs human turn responsibilities
- XML tags for structural clarity (`<context>`, `<instructions>`, `<example>`)
- Few-shot and chain-of-thought prompting
- Role prompting and persona assignment
- Forcing structured output via tool use and `response_format`
- Prompt injection risks and mitigation (delimiters, explicit instructions)
- Iterative refinement: self-critique and revision patterns

## Domain 5 — Context Management & Reliability (13%)
- Context window sizes by model tier (Haiku, Sonnet, Opus)
- Token counting and cost estimation
- Prompt caching: `cache_control` breakpoints, TTL, cache hit pricing
- Conversation history truncation and summarization strategies
- Streaming responses: SSE event types, handling partial results
- Batch API: use cases, throughput vs latency trade-offs
- Handling API errors: retries, exponential backoff, rate limits
