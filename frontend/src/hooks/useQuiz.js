import { useState, useCallback } from 'react'
import { generateQuiz, saveScore } from '../services/api'

const initialState = {
  status: 'idle', // idle | loading | active | finished
  questions: [],
  currentIndex: 0,
  answers: {},
  error: null,
}

export function useQuiz() {
  const [state, setState] = useState(initialState)

  const start = useCallback(async ({ topic, difficulty, count, useWeights }) => {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    try {
      const questions = await generateQuiz({ topic, difficulty, count, useWeights })
      setState({
        status: 'active',
        questions,
        currentIndex: 0,
        answers: {},
        error: null,
      })
    } catch (err) {
      setState((s) => ({ ...s, status: 'idle', error: err.message }))
    }
  }, [])

  const answer = useCallback((questionId, selected) => {
    setState((s) => ({
      ...s,
      answers: { ...s.answers, [questionId]: selected },
    }))
  }, [])

  const next = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
    }))
  }, [])

  const prev = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: Math.max(s.currentIndex - 1, 0),
    }))
  }, [])

  const submit = useCallback(async ({ topicFilter, difficultyFilter }) => {
    setState((s) => {
      const answerRecords = s.questions.map((q) => ({
        question_id: q.id,
        topic: q.topic,
        selected: s.answers[q.id] || '',
        correct: q.correct_answer,
        is_correct: s.answers[q.id] === q.correct_answer,
      }))

      const correctCount = answerRecords.filter((a) => a.is_correct).length
      const session = {
        session_id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        total: s.questions.length,
        correct: correctCount,
        score_pct: Math.round((correctCount / s.questions.length) * 100),
        answers: answerRecords,
        topic_filter: topicFilter || null,
        difficulty_filter: difficultyFilter || null,
      }

      saveScore(session).catch(console.error)

      return { ...s, status: 'finished', session }
    })
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const currentQuestion = state.questions[state.currentIndex] || null
  const isAnswered = currentQuestion ? state.answers[currentQuestion.id] != null : false
  const isLast = state.currentIndex === state.questions.length - 1

  return {
    ...state,
    currentQuestion,
    isAnswered,
    isLast,
    start,
    answer,
    next,
    prev,
    submit,
    reset,
  }
}
