import { Flame, TrendingUp, ListChecks, Star, Download } from 'lucide-react'

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

export default function Dashboard({ store }) {
  const completion = store.getCompletionRate()
  const todayJournal = store.getTodayJournal()
  const pendingTodos = store.getPendingTodos()
  const history = store.getJournalHistory()

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const avgScore = history.filter(d => d.journal).length > 0
    ? (history.filter(d => d.journal).reduce((a, d) => a + d.journal.score, 0) / history.filter(d => d.journal).length).toFixed(1)
    : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {today.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)' }}>{greeting}</h1>
      </div>

      {/* 2-col on desktop, stacked on mobile */}
      <div className="dashboard-grid">

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progress */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
            <ProgressRing percentage={completion} />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Today's habits</p>
              <p style={{ fontSize: 32, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>
                {Object.values(store.getTodayHabits()).filter(Boolean).length}
                <span style={{ fontSize: 18, color: 'var(--text-3)' }}>/{store.habits.length}</span>
              </p>
              <p style={{ fontSize: 12, marginTop: 6, color: completion === 100 ? 'var(--success)' : 'var(--text-3)' }}>
                {completion === 100 ? 'Perfect day' : `${store.habits.length - Object.values(store.getTodayHabits()).filter(Boolean).length} remaining`}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard icon={Flame} label="Streak" value={`${store.smokeStreak}d`} color="var(--danger)" sub="smoke-free" />
            <StatCard icon={ListChecks} label="Tasks" value={pendingTodos} color="var(--tcs)" sub="pending" />
            <StatCard icon={Star} label="Today" value={`${todayJournal.score}/10`} color="var(--accent)" sub="day score" />
            <StatCard icon={TrendingUp} label="Average" value={avgScore} color="var(--success)" sub="last 7 days" />
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Week */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, flex: 1 }}>
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
              width: '100%', padding: '14px 0', borderRadius: 12,
              background: 'var(--surface)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: 500, color: 'var(--text-3)',
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
    </div>
  )
}
