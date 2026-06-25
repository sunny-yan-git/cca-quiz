import { useState, useCallback } from 'react'
import { fetchQuestion, submitAnswer } from '../services/api'

const initialState = {
  status: 'idle',      // idle | loading | active | reviewing | finished
  question: null,
  result: null,        // { correct, correct_answer, explanation, domain }
  score: { correct: 0, total: 0 },
  domain: null,
  difficulty: 'medium',
  error: null,
}

export function useQuiz() {
  const [state, setState] = useState(initialState)

  const start = useCallback(async (domain, difficulty = 'medium') => {
    setState({ ...initialState, status: 'loading', domain, difficulty })
    try {
      const question = await fetchQuestion(domain, difficulty)
      setState((s) => ({ ...s, status: 'active', question }))
    } catch (err) {
      setState((s) => ({ ...s, status: 'idle', error: err.message }))
    }
  }, [])

  const answer = useCallback(async (selectedAnswer) => {
    if (!state.question) return
    setState((s) => ({ ...s, status: 'loading' }))
    try {
      const result = await submitAnswer(
        state.question.id,
        selectedAnswer,
        state.domain,
        state.difficulty,
      )
      setState((s) => ({
        ...s,
        status: 'reviewing',
        result,
        score: {
          correct: s.score.correct + (result.correct ? 1 : 0),
          total: s.score.total + 1,
        },
      }))
    } catch (err) {
      setState((s) => ({ ...s, status: 'active', error: err.message }))
    }
  }, [state.question, state.domain, state.difficulty])

  const next = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', question: null, result: null, error: null }))
    try {
      const question = await fetchQuestion(state.domain, state.difficulty)
      setState((s) => ({ ...s, status: 'active', question }))
    } catch (err) {
      setState((s) => ({ ...s, status: 'reviewing', error: err.message }))
    }
  }, [state.domain, state.difficulty])

  const finish = useCallback(() => {
    setState((s) => ({ ...s, status: 'finished' }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const hydrate = useCallback((saved) => {
    setState({
      ...initialState,
      status: saved.status,
      question: saved.question,
      result: saved.result,
      score: saved.score,
      domain: saved.domain,
      difficulty: saved.difficulty,
    })
  }, [])

  return {
    ...state,
    start,
    answer,
    next,
    finish,
    reset,
    hydrate,
  }
}
