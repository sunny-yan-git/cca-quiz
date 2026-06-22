import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

export async function fetchTopics() {
  const { data } = await client.get('/quiz/topics')
  return data
}

export async function generateQuiz({ topic, difficulty, count, useWeights = false }) {
  const { data } = await client.post('/quiz/generate', {
    topic: topic || null,
    difficulty: difficulty || null,
    count,
    use_weights: useWeights,
  })
  return data
}

export async function saveScore(session) {
  const { data } = await client.post('/scores', session)
  return data
}

export async function fetchScores() {
  const { data } = await client.get('/scores')
  return data
}
