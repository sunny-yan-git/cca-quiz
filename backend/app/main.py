from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import quiz, scores

app = FastAPI(title="CCA-F Exam Simulator API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router, prefix="/api")
app.include_router(scores.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
