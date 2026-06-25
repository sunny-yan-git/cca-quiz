import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import AnswerOption from '../components/AnswerOption'
import ProgressBar from '../components/ProgressBar'

export default function QuizPage() {
  const navigate = useNavigate()
  const { state: routeState } = useLocation()
  const domain = routeState?.domain ?? null
  const difficulty = routeState?.difficulty ?? 'medium'
  const questionCount = routeState?.count ?? 10

  const quiz = useQuiz()
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [history, setHistory] = useState([])   // boolean per answered question
  const [showExplain, setShowExplain] = useState(false)

  // Restore from sessionStorage on mount, or start fresh
  useEffect(() => {
    const saved = sessionStorage.getItem('quiz_state')
    if (saved) {
      const state = JSON.parse(saved)
      setHistory(state.history)
      quiz.hydrate(state)
    } else {
      quiz.start(domain, difficulty)
    }
  }, [])

  // Persist quiz progress so it survives navigation away and back
  useEffect(() => {
    if (quiz.question) {
      sessionStorage.setItem('quiz_state', JSON.stringify({
        question: quiz.question,
        status: quiz.status,
        result: quiz.result,
        score: quiz.score,
        history,
        domain,
        difficulty,
        questionCount,
      }))
    }
  }, [quiz.question, quiz.status, quiz.result, history])

  // Append to history each time an answer is reviewed
  useEffect(() => {
    if (quiz.status === 'reviewing' && quiz.result) {
      setHistory((prev) => [...prev, quiz.result.correct])
    }
  }, [quiz.status]) // intentionally omits quiz.result to fire once per status transition

  function handleSelect(optionId) {
    if (quiz.status !== 'active') return
    setSelectedAnswer(optionId)
    quiz.answer(optionId)
  }

  function handleNext() {
    if (history.length >= questionCount) {
      sessionStorage.removeItem('quiz_state')
      navigate('/results', {
        state: { score: quiz.score, domain, difficulty, questionCount, history },
      })
      return
    }
    setSelectedAnswer(null)
    setShowExplain(false)
    quiz.next()
  }

  // Full-page spinner: fetching a new question (question cleared on next())
  if ((quiz.status === 'loading' || quiz.status === 'idle') && !quiz.question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading question…</p>
        </div>
      </div>
    )
  }

  // Error with no question to fall back on (initial load failure or next() failure)
  if (quiz.error && !quiz.question) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center space-y-4">
          <p className="text-red-600 font-semibold">Failed to load question</p>
          <p className="text-slate-500 text-sm">{quiz.error}</p>
          <button
            onClick={() => quiz.start(domain, difficulty)}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!quiz.question) return null

  const q = quiz.question
  const isReviewing = quiz.status === 'reviewing'
  const isSubmitting = quiz.status === 'loading' && !!quiz.question
  const isLastQuestion = history.length >= questionCount

  // current = 0-based index of the question being shown
  const currentIndex = isReviewing ? history.length - 1 : history.length

  return (
    <div className="flex flex-col items-center py-8 px-6 min-h-screen">
      <div className="w-full max-w-2xl space-y-5">
        <ProgressBar current={currentIndex} total={questionCount} history={history} />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          {/* Domain / difficulty tags */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-100 text-indigo-700">
              {q.domain}
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 capitalize">
              {q.difficulty}
            </span>
          </div>

          {/* Scenario context */}
          {q.scenario_context && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900 leading-relaxed">
              <span className="font-semibold block mb-1">Scenario</span>
              {q.scenario_context}
            </div>
          )}

          {/* Question */}
          <p className="text-slate-800 text-lg font-medium leading-snug">{q.question}</p>

          {/* Answer options */}
          <div className="space-y-3">
            {q.options.map((opt) => (
              <AnswerOption
                key={opt.id}
                option={opt}
                selected={selectedAnswer === opt.id}
                revealed={isReviewing}
                correct={isReviewing ? quiz.result?.correct_answer : null}
                onClick={() => handleSelect(opt.id)}
              />
            ))}
          </div>

          {/* Submitting spinner (inline, keeps question visible) */}
          {isSubmitting && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Checking answer…
            </div>
          )}

          {/* Explanation callout */}
          {isReviewing && quiz.result && (
            <div className={[
              'rounded-lg px-4 py-3 text-sm border leading-relaxed',
              quiz.result.correct
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800',
            ].join(' ')}>
              <span className="font-semibold block mb-1">
                {quiz.result.correct ? '✓ Correct' : '✗ Incorrect'}
              </span>
              {quiz.result.explanation}
            </div>
          )}

          {/* Post-answer action buttons */}
          {isReviewing && (
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleNext}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                {isLastQuestion ? 'See Results →' : 'Next Question →'}
              </button>
              <button
                onClick={() => setShowExplain((v) => !v)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Explain More
              </button>
            </div>
          )}

          {/* Explain More: copyable /explain prompt */}
          {showExplain && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600">
                Copy this into Claude Code to go deeper:
              </p>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap break-all bg-white border border-slate-100 rounded p-2 select-all leading-relaxed">
                {`/explain "${q.domain}" — ${q.question}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
