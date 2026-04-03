import { Download } from 'lucide-react'
import {
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

const fmt = (score) => {
  const s = parseFloat(score)
  return s % 1 === 0 ? `${parseInt(s)}` : `${s.toFixed(1)}`
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ fontSize: 12, fontWeight: 600, color: p.color }}>
          {p.name}: {p.value != null ? (p.dataKey === 'score' ? `${fmt(p.value)}/5` : `${p.value}%`) : '—'}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard({ store }) {
  const completion = store.getCompletionRate()
  const todayJournal = store.getTodayJournal()
  const pendingTodos = store.getPendingTodos()
  const history = store.getJournalHistory()
  const fullHistory = store.getFullHistory(30)

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const normalizeScore = (s) => s > 5 ? Math.round(s / 2) : s
  const displayScore = normalizeScore(todayJournal.score)

  const getScoreColor = (s) => {
    if (s >= 4) return 'var(--success)'
    if (s >= 3) return 'var(--accent)'
    return 'var(--danger)'
  }

  const doneCount = Object.values(store.getTodayHabits()).filter(Boolean).length

  const journalDays = history.filter(d => d.journal)
  const weekAvgRaw = journalDays.length > 0
    ? journalDays.reduce((a, d) => a + normalizeScore(d.journal.score), 0) / journalDays.length
    : null
  const weekAvg = weekAvgRaw !== null ? fmt(weekAvgRaw) : null

  const chartData = fullHistory.map(d => ({
    label: d.label,
    score: d.score != null ? normalizeScore(d.score) : null,
    habits: d.habitsCompleted > 0 ? d.habitsPct : null,
  }))

  const weeklyReview = store.getWeeklyReview ? store.getWeeklyReview() : null
  const todayFocus = store.journalFocus?.[store.today]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ paddingBottom: 4 }}>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>{greeting}</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          {today.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h1>
      </div>

      <div className="dashboard-grid">
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Today habits */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Today</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div>
                <span style={{ fontSize: 48, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{doneCount}</span>
                <span style={{ fontSize: 20, color: 'var(--text-3)' }}>/{store.habits.length}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Habits</span>
                  <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: completion === 100 ? 'var(--success)' : 'var(--accent)' }}>{completion}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-3)' }}>
                  <div style={{ height: '100%', width: `${completion}%`, borderRadius: 2, background: completion === 100 ? 'var(--success)' : 'var(--accent)', transition: 'width 0.6s ease' }} />
                </div>
                <p style={{ fontSize: 11, color: completion === 100 ? 'var(--success)' : 'var(--text-3)', marginTop: 8 }}>
                  {completion === 100 ? 'Perfect day' : `${store.habits.length - doneCount} remaining`}
                </p>
              </div>
            </div>
          </div>

          {/* 4 stat cards 2x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard label="Smoke-free" value={`${store.smokeStreak}d`} />
            <StatCard label="Pending" value={pendingTodos} sub="tasks" />
            <StatCard label="Score" value={displayScore > 0 ? `${displayScore}/5` : '—'} sub="today" />
            <StatCard label="Week avg" value={weekAvg !== null ? `${weekAvg}/5` : '—'} sub="journal" />
          </div>

          {/* Today's focus if filled */}
          {todayFocus && (
            <div style={{ background: 'var(--accent-dim)', borderRadius: 12, padding: '12px 16px', border: '1px solid var(--accent)' }}>
              <p style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Today's focus</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{todayFocus}</p>
            </div>
          )}
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* This week */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>This week</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {history.map((day) => {
                const pct = day.habitsTotal > 0 ? (day.habitsCompleted / day.habitsTotal) * 100 : 0
                const isToday = day.date === store.today
                return (
                  <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                      background: pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--accent-dim)' : 'var(--surface-2)',
                      color: pct === 100 ? '#ffffff' : pct > 0 ? 'var(--accent)' : 'var(--text-3)',
                      border: isToday ? '2px solid var(--accent)' : '1px solid var(--border)',
                    }}>
                      {day.habitsCompleted}
                    </div>
                    <span style={{ fontSize: 10, color: isToday ? 'var(--accent)' : 'var(--text-3)', fontWeight: isToday ? 600 : 400 }}>
                      {day.shortDate}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Weekly review */}
          {weeklyReview && (
            <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Weekly review</p>
              </div>
              {[
                { label: 'Habit completion', value: `${weeklyReview.habitsPct}%` },
                { label: 'Avg score', value: weeklyReview.avgScore !== null ? `${fmt(weeklyReview.avgScore)}/5` : '—' },
                { label: 'Tasks done', value: weeklyReview.completedTodos },
                { label: 'Best habit', value: weeklyReview.bestHabit?.label ?? '—' },
                { label: 'To improve', value: weeklyReview.worstHabit?.label ?? '—' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 30-day chart */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>30-day trends</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 16, height: 2, borderRadius: 1, background: 'var(--accent)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Journal score</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 16, height: 2, borderRadius: 1, background: 'var(--success)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Habits %</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => store.exportToExcel()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg)', cursor: 'pointer',
              fontSize: 12, color: 'var(--text-3)', fontWeight: 500, transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
          >
            <Download size={13} />
            Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 28, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }} tickLine={false} axisLine={false} interval={6} />
            <YAxis yAxisId="left" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line yAxisId="left" type="monotone" dataKey="habits" name="Habits" stroke="var(--success)" strokeWidth={2} dot={false} connectNulls={false} />
            <Line yAxisId="right" type="monotone" dataKey="score" name="Score" stroke="var(--accent)" strokeWidth={2} dot={false} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
