import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const NAV = [
  { label: 'Quiz', to: '/' },
  { label: 'Dashboard', to: '/results' },
]

export default function Sidebar() {
  const location = useLocation()
  const [focusDomain, setFocusDomain] = useState(null)

  useEffect(() => {
    setFocusDomain(localStorage.getItem('focusDomain') || null)

    function onStorage(e) {
      if (e.key === 'focusDomain') setFocusDomain(e.newValue || null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <aside className="w-[200px] shrink-0 flex flex-col bg-white border-r border-slate-200 px-4 py-6 gap-6">
      <span className="text-indigo-700 font-bold text-lg tracking-tight">CCA-F Prep</span>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ label, to }) => {
          const isActive =
            to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={[
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')}
            >
              {label}
            </NavLink>
          )
        })}
      </nav>

      {focusDomain && (
        <div className="mt-auto">
          <span className="inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700 font-medium break-all">
            Focusing: {focusDomain}
          </span>
        </div>
      )}
    </aside>
  )
}
