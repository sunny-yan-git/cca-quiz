import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchScores } from '../services/api'

const DOMAIN_LABELS = {
  'agentic-architecture': 'Agentic Architecture & Orchestration',
  'tool-design-mcp': 'Tool Design & MCP Integration',
  'claude-code-config': 'Claude Code Configuration',
  'prompt-engineering': 'Prompt Engineering & Structured Output',
  'context-management': 'Context Management & Reliability',
}

const STUDY_TIPS = {
  'agentic-architecture': [
    'Know when to use ReAct vs plan-and-execute loops, and how reflection loops improve agent accuracy.',
    'Subagents do NOT inherit parent context — always pass context explicitly in the subagent prompt.',
    'Hooks give deterministic guarantees; prompt instructions are probabilistic. Use hooks for policy enforcement.',
  ],
  'tool-design-mcp': [
    'Use tool_choice to force a specific tool call; return structured errors via tool_result so the model can recover.',
    'Avoid tool overload — 4–5 focused tools outperform 18 broad ones for reliable tool selection.',
    'Know MCP transport types (stdio vs SSE) and the difference between resources, prompts, and tools.',
  ],
  'claude-code-config': [
    'CLAUDE.md is loaded from three locations in order: repo root, subdirectory, then home directory.',
    'settings.json is shared/committed; settings.local.json is personal overrides — never commit secrets there.',
    'Use @import in CLAUDE.md to reference external rule files and keep configuration modular.',
  ],
  'prompt-engineering': [
    'Use XML tags (<context>, <instructions>, <example>) to give Claude unambiguous structural cues.',
    'Force structured output via tool use — it is more reliable than asking for JSON in prose.',
    'Mitigate prompt injection with explicit trust delimiters and instructions about untrusted content.',
  ],
  'context-management': [
    'Prompt caching: set cache_control breakpoints at stable prefixes; TTL is 5 minutes; cache hits cost ~10% of normal.',
    'Use the Batch API for throughput-optimized workloads; use streaming (SSE) when latency matters.',
    'Truncate or summarize conversation history before the context window fills — never silently drop tokens.',
  ],
}

function passInfo(pct) {
  if (pct >= 72) return { label: 'Pass range ✓', cls: 'bg-green-50 border-green-300 text-green-800' }
  if (pct >= 60) return { label: 'Getting close', cls: 'bg-amber-50 border-amber-300 text-amber-800' }
  return { label: 'Needs work', cls: 'bg-red-50 border-red-300 text-red-700' }
}

function pctColor(pct) {
  if (pct >= 72) return 'text-green-600'
  if (pct >= 60) return 'text-amber-600'
  return 'text-red-500'
}

function deltaLabel(sessionAcc, allTimeAcc) {
  const diff = Math.round((sessionAcc - allTimeAcc) * 100)
  if (diff > 0) return { text: `+${diff}%`, cls: 'text-green-600' }
  if (diff < 0) return { text: `${diff}%`, cls: 'text-red-500' }
  return { text: '—', cls: 'text-slate-400' }
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const { state: routeState } = useLocation()

  // Passed from QuizPage via navigate('/results', { state: {...} })
  const sessionScore = routeState?.score ?? null   // { correct, total }
  const sessionDomain = routeState?.domain ?? null
  const sessionDifficulty = routeState?.difficulty ?? 'medium'
  const questionCount = routeState?.questionCount ?? null

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  // Current session ID was stored in sessionStorage by api.js getSessionId()
  const sessionId = sessionStorage.getItem('quiz_session_id')

  useEffect(() => {
    fetchScores()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // --- Derived values ---

  // Find the current session's per-domain breakdown from backend data
  const currentSession = summary?.sessions?.find((s) => s.session_id === sessionId) ?? null

  // Overall accuracy for this session
  const sessionCorrect = sessionScore?.correct ?? currentSession?.questions_answered ?? 0
  const sessionTotal = sessionScore?.total ?? currentSession?.questions_answered ?? questionCount ?? 0
  const sessionPct = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0
  const pass = passInfo(sessionPct)

  // Domain scores for this session
  const sessionDomains = currentSession?.domain_scores
    ? Object.values(currentSession.domain_scores)
    : []

  // All-time data
  const allTimeDomains = summary?.domain_accuracies ?? {}
  const weakest = summary?.weakest_domain ?? null
  const studyTips = weakest ? STUDY_TIPS[weakest] ?? [] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-8 px-6 min-h-screen">
      <div className="w-full max-w-2xl space-y-6">

        {/* Session summary header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Session Score</p>
              <p className={`text-5xl font-bold tabular-nums ${pctColor(sessionPct)}`}>
                {sessionPct}%
              </p>
              <p className="text-slate-500 mt-1 text-sm">
                {sessionScore
                  ? `${sessionScore.correct} / ${sessionScore.total} correct`
                  : currentSession
                    ? `${currentSession.questions_answered} questions answered`
                    : 'No session data'}
              </p>
              {sessionDomain && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Domain: {DOMAIN_LABELS[sessionDomain] ?? sessionDomain} · {sessionDifficulty}
                </p>
              )}
            </div>
            <span className={`shrink-0 mt-1 text-sm font-semibold px-3 py-1.5 rounded-full border ${pass.cls}`}>
              {pass.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Exam passing threshold: 720 / 1000 (72%)
          </p>
        </div>

        {/* Per-domain breakdown — this session */}
        {sessionDomains.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">This Session — Domain Breakdown</h2>
            <div className="space-y-3">
              {sessionDomains.map((ds) => {
                const pct = Math.round(ds.accuracy * 100)
                return (
                  <div key={ds.domain}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="truncate mr-2">
                        {DOMAIN_LABELS[ds.domain] ?? ds.domain}
                      </span>
                      <span className={`shrink-0 font-semibold ${pctColor(pct)}`}>
                        {ds.correct}/{ds.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 72 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Compared to all time */}
        {sessionDomains.length > 0 && Object.keys(allTimeDomains).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">Compared to All-Time</h2>
            <div className="divide-y divide-slate-100">
              {sessionDomains.map((ds) => {
                const allTime = allTimeDomains[ds.domain]
                if (allTime == null) return null
                const sessionAcc = ds.accuracy
                const delta = deltaLabel(sessionAcc, allTime)
                return (
                  <div key={ds.domain} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-slate-600 truncate mr-4">
                      {DOMAIN_LABELS[ds.domain] ?? ds.domain}
                    </span>
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="text-slate-400">
                        All-time: {Math.round(allTime * 100)}%
                      </span>
                      <span className={`font-semibold ${delta.cls}`}>{delta.text}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recommended focus */}
        {weakest && studyTips.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 space-y-3">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-0.5">
                Recommended Focus
              </p>
              <h2 className="text-sm font-bold text-indigo-900">
                {DOMAIN_LABELS[weakest] ?? weakest}
              </h2>
            </div>
            <ul className="space-y-2">
              {studyTips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-indigo-800">
                  <span className="shrink-0 mt-0.5 text-indigo-400">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={() =>
              navigate('/', { state: { domain: sessionDomain, difficulty: sessionDifficulty } })
            }
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Study Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Change Settings
          </button>
        </div>

      </div>
    </div>
  )
}
