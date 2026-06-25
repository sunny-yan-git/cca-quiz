export default function AnswerOption({ option, selected, revealed, correct, onClick }) {
  let cls = 'w-full text-left px-4 py-3 rounded-lg border-2 transition-colors font-medium flex items-start gap-2'
  let badge = null

  if (!revealed) {
    cls += selected
      ? ' border-indigo-500 bg-indigo-50 text-indigo-800'
      : ' border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-slate-700'
  } else if (option.id === correct) {
    cls += ' border-green-500 bg-green-50 text-green-800'
    badge = <span className="shrink-0 font-bold text-green-600 mt-0.5">✓</span>
  } else if (selected) {
    cls += ' border-red-400 bg-red-50 text-red-700'
    badge = <span className="shrink-0 font-bold text-red-500 mt-0.5">✗</span>
  } else {
    cls += ' border-slate-200 bg-white text-slate-400'
  }

  return (
    <button className={cls} onClick={onClick} disabled={revealed}>
      <span className="font-bold shrink-0">{option.id}.</span>
      <span className="flex-1">{option.text}</span>
      {badge}
    </button>
  )
}
