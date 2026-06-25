export default function ProgressBar({ current, total, history = [] }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-slate-500">
        <span>Question {current + 1} of {total}</span>
        <span>{history.filter(Boolean).length} / {history.length} correct</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => {
          let cls = 'h-2.5 flex-1 rounded-full transition-colors'
          if (i < history.length) {
            cls += history[i] ? ' bg-green-500' : ' bg-red-400'
          } else if (i === current) {
            cls += ' bg-indigo-500'
          } else {
            cls += ' bg-slate-200'
          }
          return <div key={i} className={cls} />
        })}
      </div>
    </div>
  )
}
