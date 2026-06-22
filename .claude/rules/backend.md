---
globs: backend/**
---

# Backend Conventions

## FastAPI
- All route handlers are `async def`.
- Request/response bodies use Pydantic models defined in `app/models/`.
- Business logic belongs in `app/services/`, not in routers.
- Routers are registered in `app/main.py` with an `/api` prefix.

## Python
- Python 3.11+; use `pathlib.Path` for file I/O, not `os.path`.
- Settings loaded via `app/config.py` (pydantic-settings); never hardcode secrets.
- JSON persistence via `app/services/question_service.py` — no direct file I/O in routers.

## Anthropic SDK
- All Claude API calls are in `app/services/claude_service.py`.
- Use the async client (`AsyncAnthropic`) so FastAPI event loop is not blocked.
- Model ID must come from `settings.model`, never hardcoded.
- Always handle `anthropic.APIError` and surface a clean HTTP 502 to the caller.

## Error Handling
- Raise `fastapi.HTTPException` with appropriate status codes from routers.
- Log unexpected errors; don't swallow them silently.
