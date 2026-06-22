import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import QuizCard from '../components/QuizCard'
import ProgressBar from '../components/ProgressBar'
import ResultsModal from '../components/ResultsModal'

export default function QuizPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const topic = searchParams.get('topic') || ''
  const difficulty = searchParams.get('difficulty') || ''
  const count = parseInt(searchParams.get('count') || '10', 10)

  const quiz = useQuiz()

  useEffect(() => {
    quiz.start({ topic, difficulty, count })
  }, [])

  if (quiz.status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Generating questions with Claude…</p>
        </div>
      </div>
    )
  }

  if (quiz.error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-semibold">Failed to load questions</p>
          <p className="text-slate-500 text-sm">{quiz.error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!quiz.currentQuestion) return null

  const handleSubmit = () => {
    quiz.submit({ topicFilter: topic, difficultyFilter: difficulty })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-2xl space-y-4">
        <ProgressBar current={quiz.currentIndex} total={quiz.questions.length} />
        <QuizCard
          question={quiz.currentQuestion}
          selectedAnswer={quiz.answers[quiz.currentQuestion.id]}
          onAnswer={quiz.answer}
          onNext={quiz.next}
          onPrev={quiz.prev}
          isFirst={quiz.currentIndex === 0}
          isLast={quiz.isLast}
          onSubmit={handleSubmit}
        />
      </div>

      {quiz.status === 'finished' && quiz.session && (
        <ResultsModal
          session={quiz.session}
          onRetry={() => {
            quiz.reset()
            quiz.start({ topic, difficulty, count })
          }}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  )
}
