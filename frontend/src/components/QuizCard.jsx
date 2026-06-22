import { useState } from 'react'
import AnswerOption from './AnswerOption'

export default function QuizCard({ question, selectedAnswer, onAnswer, onNext, onPrev, isLast, isFirst, onSubmit }) {
  const [revealed, setRevealed] = useState(false)

  const handleOption = (id) => {
    if (revealed) return
    onAnswer(question.id, id)
    setRevealed(true)
  }

  const handleNext = () => {
    setRevealed(false)
    onNext()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-100 text-indigo-700">
          {question.topic}
        </span>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 capitalize">
          {question.difficulty}
        </span>
      </div>

      <p className="text-slate-800 text-lg font-medium leading-snug">{question.question}</p>

      <div className="space-y-3">
        {question.options.map((opt) => (
          <AnswerOption
            key={opt.id}
            option={opt}
            selected={selectedAnswer === opt.id}
            revealed={revealed}
            correct={question.correct_answer}
            onClick={() => handleOption(opt.id)}
          />
        ))}
      </div>

      {revealed && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Explanation: </span>
          {question.explanation}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="px-4 py-2 rounded-lg text-slate-600 border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        {isLast ? (
          <button
            onClick={onSubmit}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
