import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTopics } from '../services/api'

const DIFFICULTIES = ['', 'easy', 'medium', 'hard']
const COUNTS = [5, 10, 15, 20]

export default function HomePage() {
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [count, setCount] = useState(10)

  useEffect(() => {
    fetchTopics().then(setTopics).catch(console.error)
  }, [])

  const handleStart = () => {
    const params = new URLSearchParams()
    if (topic) params.set('topic', topic)
    if (difficulty) params.set('difficulty', difficulty)
    params.set('count', count)
    navigate(`/quiz?${params}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-700">CCA-F Simulator</h1>
          <p className="text-slate-500 mt-2">Claude Certified Architect – Foundations</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Domain</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">All Domains</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold capitalize transition-colors ${
                    difficulty === d
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300'
                  }`}
                >
                  {d || 'Any'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Questions: {count}
            </label>
            <div className="flex gap-2">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                    count === n
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-colors"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    </div>
  )
}
