import ScoreBoard from './ScoreBoard'

export default function ResultsModal({ session, onRetry, onHome }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 text-center">Quiz Complete!</h2>
        <ScoreBoard session={session} />
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-xl border-2 border-indigo-500 text-indigo-600 font-semibold hover:bg-indigo-50"
          >
            Try Again
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            New Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
