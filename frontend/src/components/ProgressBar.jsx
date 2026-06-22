export default function ProgressBar({ current, total }) {
  const pct = Math.round(((current + 1) / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-slate-500 mb-1">
        <span>Question {current + 1} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
