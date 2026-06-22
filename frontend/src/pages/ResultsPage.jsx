import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchScores } from '../services/api'
import ScoreBoard from '../components/ScoreBoard'

export default function ResultsPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScores()
      .then((data) => setSessions([...data].reverse()))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Score History</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 text-sm"
          >
            New Quiz
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-slate-500 text-center py-12">No sessions yet. Start a quiz!</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.session_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
            >
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{new Date(session.timestamp).toLocaleString()}</span>
                <div className="flex gap-2">
                  {session.topic_filter && (
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">
                      {session.topic_filter}
                    </span>
                  )}
                  {session.difficulty_filter && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium capitalize">
                      {session.difficulty_filter}
                    </span>
                  )}
                </div>
              </div>
              <ScoreBoard session={session} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
