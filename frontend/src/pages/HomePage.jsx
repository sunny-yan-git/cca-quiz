import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTopics, fetchScores, clearSession, getSessionId } from '../services/api'

const DIFFICULTIES = ['easy', 'medium', 'hard']

export default function HomePage() {
  const navigate = useNavigate()

  const [topics, setTopics] = useState([])
  const [scores, setScores] = useState(null)
  const [scoresLoading, setScoresLoading] = useState(true)

  const [domain, setDomain] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [count, setCount] = useState(10)

  useEffect(() => {
    fetchTopics()
      .then((data) => setTopics(data.domains ?? []))
      .catch(console.error)

    fetchScores()
      .then(setScores)
      .catch(() => setScores(null))
      .finally(() => setScoresLoading(false))
  }, [])

  const overallPct =
    scores && scores.overall_accuracy != null
      ? Math.round(scores.overall_accuracy * 100)
      : null

  async function handleStart() {
    const effectiveDomain =
      domain === 'adaptive' ? (scores?.weakest_domain ?? null) : domain || null

    try {
      await clearSession(getSessionId())
    } catch (err) {
      console.error(err)
    }

    navigate('/quiz', { state: { domain: effectiveDomain, difficulty, count } })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-700">CCA-F Simulator</h1>
          <p className="mt-2 text-slate-500">
            {overallPct != null
              ? `Overall accuracy: ${overallPct}%`
              : "Let's get started"}
          </p>
        </div>

        {/* Config card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">

          {/* Domain */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="adaptive">Adaptive (weakest domain)</option>
              <option value="">All Domains</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={[
                    'flex-1 py-2 rounded-lg border-2 text-sm font-semibold capitalize transition-colors',
                    difficulty === d
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300',
                  ].join(' ')}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Questions: {count}
            </label>
            <input
              type="number"
              min={5}
              max={50}
              step={5}
              value={count}
              onChange={(e) => {
                const v = Math.min(50, Math.max(5, Number(e.target.value) || 5))
                setCount(v)
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-colors"
          >
            Start Quiz →
          </button>
        </div>

        {/* Domain performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Domain Performance</h2>

          {scoresLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-slate-200 rounded w-2/3 mb-1" />
                  <div className="h-2 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : scores && Object.keys(scores.domain_accuracies ?? {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(scores.domain_accuracies).map(([dom, acc]) => {
                const pct = Math.round(acc * 100)
                return (
                  <div key={dom}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="truncate mr-2">{dom}</span>
                      <span className="shrink-0 font-medium">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={[
                          'h-full rounded-full transition-all',
                          pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-red-400',
                        ].join(' ')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">
              No history yet — complete a quiz to see your performance.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
