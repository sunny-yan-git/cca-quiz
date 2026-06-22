export default function ScoreBoard({ session }) {
  const { correct, total, score_pct } = session

  const color =
    score_pct >= 80 ? 'text-green-600' : score_pct >= 60 ? 'text-yellow-600' : 'text-red-600'

  const topicStats = session.answers.reduce((acc, a) => {
    if (!acc[a.topic]) acc[a.topic] = { correct: 0, total: 0 }
    acc[a.topic].total++
    if (a.is_correct) acc[a.topic].correct++
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className={`text-6xl font-bold ${color}`}>{score_pct}%</p>
        <p className="text-slate-500 mt-1">
          {correct} / {total} correct
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-slate-700">By Domain</h3>
        {Object.entries(topicStats).map(([topic, stats]) => {
          const pct = Math.round((stats.correct / stats.total) * 100)
          const barColor = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'
          return (
            <div key={topic}>
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span className="truncate max-w-xs">{topic}</span>
                <span>
                  {stats.correct}/{stats.total} ({pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`${barColor} h-2 rounded-full`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
