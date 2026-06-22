# CCA-F Exam Simulator

## Project Overview
Study tool that dynamically generates CCA-F (Claude Certified Architect – Foundations) exam questions using the Anthropic API. Users select a topic and difficulty, answer multiple-choice questions, and review scored results.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS (`frontend/`)
- **Backend**: FastAPI + Python 3.11+ (`backend/`)
- **AI**: Anthropic Python SDK, model `claude-sonnet-4-6`
- **Data**: Local JSON files in `data/` (no database)

## Key Directories
- `data/question_bank.json` — seed question bank; also used as fallback if API is unavailable
- `data/scores.json` — append-only quiz session history
- `backend/app/services/claude_service.py` — all Anthropic API calls live here
- `frontend/src/hooks/useQuiz.js` — quiz state machine (fetch → answer → score → review)

## Running Locally
```bash
# Backend (from repo root)
cd backend && uvicorn app.main:app --reload

# Frontend (from repo root)
cd frontend && npm install && npm run dev
```

Backend runs on `http://localhost:8000`; frontend dev server proxies `/api` to it.

## Environment Variables
- `backend/.env` — `ANTHROPIC_API_KEY`, `MODEL`, `DATA_DIR`
- `frontend/.env` — `VITE_API_BASE_URL` (defaults to `/api` via Vite proxy)

## CCA-F Exam Domains
1. Agentic Architecture & Orchestration - 27%
2. Claude Code Configuration & Workflows - 22%
3. Prompt Engineering & Structured Output - 18%
4. Tool Design & MCP Integration - 20%
5. Context Management & Reliability - 13%
