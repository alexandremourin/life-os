import { Flame, TrendingUp, ListChecks, Star, Download } from 'lucide-react'
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
          {p.name}: {p.value != null ? (p.dataKey === 'score' ? `${p.value}/10` : `${p.value}%`) : '—'}
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

  const avgScore = history.filter(d => d.journal).length > 0
    ? (history.filter(d => d.journal).reduce((a, d) => a + d.journal.score, 0) / history.filter(d => d.journal).length).toFixed(1)
    : '—'

  // Prépare les données du graphe (garder seulement les jours avec des données)
  const chartData = fullHistory.map(d => ({
    label: d.label,
    score: d.score,
    habits: d.habitsCompleted > 0 ? d.habitsPct : null,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {today.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>{greeting}</h1>
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
                {completion === 100 ? 'Perfect day' : `${store.habits.length - Object.values(store.getTodayHabits()).filter(Boolean).length} remaining`}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard icon={Flame} label="Streak" value={`${store.smokeStreak}d`} color="var(--danger)" sub="smoke-free" />
            <StatCard icon={ListChecks} label="Tasks" value={pendingTodos} color="var(--tcs)" sub="pending" />
            <StatCard icon={Star} label="Today" value={`${todayJournal.score}/10`} color="var(--accent)" sub="day score" />
            <StatCard icon={TrendingUp} label="Average" value={avgScore} color="var(--success)" sub="last 7 days" />
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
              // Normalise score/10 → /100 pour même axe
              data={chartData.map(d => ({ ...d, score: d.score != null ? d.score * 10 : null }))}
            />
            <Line
              type="monotone" dataKey="habits"
              name="Habits" stroke="var(--success)"
              strokeWidth={2} dot={false} connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>
          Score affiché sur 100 (×10) pour comparaison
        </p>
      </div>
    </div>
  )
}
