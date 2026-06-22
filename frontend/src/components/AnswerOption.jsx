export default function AnswerOption({ option, selected, revealed, correct, onClick }) {
  let base = 'w-full text-left px-4 py-3 rounded-lg border-2 transition-colors font-medium'

  if (!revealed) {
    base += selected
      ? ' border-indigo-500 bg-indigo-50 text-indigo-800'
      : ' border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-slate-700'
  } else {
    if (option.id === correct) {
      base += ' border-green-500 bg-green-50 text-green-800'
    } else if (selected && option.id !== correct) {
      base += ' border-red-400 bg-red-50 text-red-700'
    } else {
      base += ' border-slate-200 bg-white text-slate-400'
    }
  }

  return (
    <button className={base} onClick={onClick} disabled={revealed}>
      <span className="font-bold mr-2">{option.id}.</span>
      {option.text}
    </button>
  )
}
