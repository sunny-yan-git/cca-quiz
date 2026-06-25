const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

function getSessionId() {
  const key = 'quiz_session_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

async function request(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail ?? JSON.stringify(body)
    } catch (_) {}
    throw new Error(`${res.status} ${detail}`)
  }
  return res.json()
}

export function fetchQuestion(domain, difficulty) {
  return request('/quiz/generate', {
    method: 'POST',
    body: JSON.stringify({
      domain: domain || null,
      difficulty: difficulty || 'medium',
      session_id: getSessionId(),
    }),
  })
}

export function submitAnswer(questionId, selectedAnswer, domain, difficulty) {
  return request('/scores', {
    method: 'POST',
    body: JSON.stringify({
      question_id: questionId,
      session_id: getSessionId(),
      selected_answer: selectedAnswer,
      domain: domain || 'general',
      difficulty,
    }),
  })
}

export function fetchScores() {
  return request('/scores')
}

export function fetchTopics() {
  return request('/quiz/topics')
}
