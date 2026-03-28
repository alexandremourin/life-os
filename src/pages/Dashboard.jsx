import { Flame, TrendingUp, ListChecks, Star, Download, Zap } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

function ProgressRing({ percentage, size = 110, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle className="progress-ring-bg" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} fill="none" />
      <circle className="progress-ring-fill" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fill: 'var(--accent)', fontSize: 22, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
        {percentage}%
      </text>
    </svg>
  )
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={14} style={{ color }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <span style={{ fontSize: 26, fontWeight: 600, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px',
      border: '1px solid var(--surface-3)',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ fontSize: 12, fontWeight: 600, color: p.color, fontFamily: 'JetBrains Mono, monospace' }}>
          {p.name}: {p.value != null ? (p.dataKey === 'score' ? `${(p.value / 10).toFixed(1)}/5` : `${p.value}%`) : '—'}
        </p>
      ))}
    </div>
  )
}

const LEVEL_NAMES = ['Beginner', 'Apprentice', 'Committed', 'Advanced', 'Master']

export default function Dashboard({ store }) {
  const completion = store.getCompletionRate()
  const todayJournal = store.getTodayJournal()
  const pendingTodos = store.getPendingTodos()
  const history = store.getJournalHistory()
  const fullHistory = store.getFullHistory(30)

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Normalize score /10 → /5
  const normalizeScore = (s) => s > 5 ? Math.round(s / 2) : s
  const displayScore = normalizeScore(todayJournal.score)

  const avgScore = history.filter(d => d.journal).length > 0
    ? (history.filter(d => d.journal).reduce((a, d) => a + normalizeScore(d.journal.score), 0) / history.filter(d => d.journal).length).toFixed(1)
    : '—'

  // Chart data
  const chartData = fullHistory.map(d => ({
    label: d.label,
    score: d.score != null ? normalizeScore(d.score) * 10 : null, // ×10 for same axis as habits%
    habits: d.habitsCompleted > 0 ? d.habitsPct : null,
  }))

  // XP / Level
  const xp = store.getTotalXP ? store.getTotalXP() : 0
  const levelInfo = store.getLevelInfo ? store.getLevelInfo() : { level: 1, name: 'Beginner', xp, xpForNext: 100, progress: 0 }

  // Weekly Review
  const weeklyReview = store.getWeeklyReview ? store.getWeeklyReview() : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {today.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>{greeting}</h1>
      </div>

      {/* XP bar */}
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Level {levelInfo.level} — {levelInfo.name}</span>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)' }}>
            {levelInfo.xp} / {levelInfo.max ?? '∞'} XP
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${levelInfo.pct}%`,
            background: 'var(--accent)',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>
          +10 XP per habit · +50 XP for a perfect day
        </p>
      </div>

      {/* 2-col on desktop */}
      <div className="dashboard-grid">
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
            <ProgressRing percentage={completion} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Today's habits</p>
              <p style={{ fontSize: 32, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>
                {Object.values(store.getTodayHabits()).filter(Boolean).length}
                <span style={{ fontSize: 18, color: 'var(--text-3)' }}>/{store.habits.length}</span>
              </p>
              <p style={{ fontSize: 12, marginTop: 6, color: completion === 100 ? 'var(--success)' : 'var(--text-3)' }}>
                {completion === 100 ? 'Perfect day ✦' : `${store.habits.length - Object.values(store.getTodayHabits()).filter(Boolean).length} remaining`}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard icon={Flame} label="Streak" value={`${store.smokeStreak}d`} color="var(--danger)" sub="smoke-free" />
            <StatCard icon={ListChecks} label="Tasks" value={pendingTodos} color="var(--tcs)" sub="pending" />
            <StatCard icon={Star} label="Today" value={`${displayScore}/5`} color="var(--accent)" sub="day score" />
            <StatCard icon={TrendingUp} label="Average" value={avgScore !== '—' ? `${avgScore}/5` : '—'} color="var(--success)" sub="this week" />
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Week overview */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24 }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>This week</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {history.map((day) => {
                const pct = day.habitsTotal > 0 ? (day.habitsCompleted / day.habitsTotal) * 100 : 0
                const isToday = day.date === store.today
                return (
                  <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                      background: pct === 100 ? 'var(--success-dim)' : pct > 0 ? 'var(--accent-dim)' : 'var(--surface-2)',
                      color: pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--accent)' : 'var(--text-3)',
                      outline: isToday ? '1.5px solid var(--accent)' : 'none',
                    }}>
                      {day.habitsCompleted}
                    </div>
                    <span style={{ fontSize: 10, color: isToday ? 'var(--accent)' : 'var(--text-3)', fontWeight: 500 }}>
                      {day.shortDate}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Weekly review */}
          {weeklyReview && (
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '18px 20px' }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Weekly review</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Avg journal score', value: weeklyReview.avgScore !== null ? `${weeklyReview.avgScore}/5` : '—', color: 'var(--accent)' },
                  { label: 'Habit completion', value: `${weeklyReview.habitsPct}%`, color: weeklyReview.habitsPct >= 80 ? 'var(--success)' : 'var(--accent)' },
                  { label: 'Tasks completed', value: weeklyReview.completedTodos, color: 'var(--tcs)' },
                  { label: 'Best habit', value: weeklyReview.bestHabit?.label ?? '—', color: 'var(--success)' },
                  { label: 'To improve', value: weeklyReview.worstHabit?.label ?? '—', color: 'var(--danger)' },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--surface-2)' : 'none' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: row.color, fontFamily: 'JetBrains Mono, monospace' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export */}
          <button
            onClick={() => store.exportToExcel()}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'var(--surface)', fontSize: 13, fontWeight: 500, color: 'var(--text-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
          >
            <Download size={15} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Graphe 30 jours */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24 }}>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          30-day trends
        </p>
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 2, borderRadius: 1, background: 'var(--accent)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Journal score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 2, borderRadius: 1, background: 'var(--success)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Habits %</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--surface-2)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false} axisLine={false}
              interval={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false} axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="score"
              name="Score" stroke="var(--accent)"
              strokeWidth={2} dot={false} connectNulls={false}
            />
            <Line
              type="monotone" dataKey="habits"
              name="Habits" stroke="var(--success)"
              strokeWidth={2} dot={false} connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
