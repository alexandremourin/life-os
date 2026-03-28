import { Flame, TrendingUp, ListChecks, Star, Download } from 'lucide-react'

function ProgressRing({ percentage, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} className="block">
      <circle
        className="progress-ring-bg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        className="progress-ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-mono"
        style={{ fill: 'var(--accent)', fontSize: '28px', fontWeight: 600 }}
      >
        {percentage}%
      </text>
    </svg>
  )
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
          {label}
        </span>
      </div>
      <span className="text-2xl font-semibold font-mono" style={{ color }}>
        {value}
      </span>
      {sub && (
        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
          {sub}
        </span>
      )}
    </div>
  )
}

export default function Dashboard({ store }) {
  const completion = store.getCompletionRate()
  const todayJournal = store.getTodayJournal()
  const pendingTodos = store.getPendingTodos()
  const history = store.getJournalHistory()

  const today = new Date()
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          {today.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-semibold mt-1">{greeting}</h1>
      </div>

      {/* Desktop: 2-col grid / Mobile: stacked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left column */}
        <div className="space-y-6">
          {/* Progress ring */}
          <div
            className="rounded-2xl p-6 flex items-center gap-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <ProgressRing percentage={completion} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                Today's habits
              </p>
              <p className="text-3xl font-bold font-mono mt-1" style={{ color: 'var(--text)' }}>
                {Object.values(store.getTodayHabits()).filter(Boolean).length}
                <span className="text-lg" style={{ color: 'var(--text-3)' }}>
                  /{store.habits.length}
                </span>
              </p>
              <p className="text-xs mt-2" style={{ color: completion === 100 ? 'var(--success)' : 'var(--text-3)' }}>
                {completion === 100 ? 'Perfect day!' : `${100 - completion}% remaining`}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Flame}
              label="Smoke streak"
              value={`${store.smokeStreak}d`}
              color="var(--danger)"
              sub="days without smoking"
            />
            <StatCard
              icon={ListChecks}
              label="Pending tasks"
              value={pendingTodos}
              color="var(--tcs)"
              sub="across all categories"
            />
            <StatCard
              icon={Star}
              label="Day score"
              value={`${todayJournal.score}/10`}
              color="var(--accent)"
              sub="your rating today"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg score"
              value={
                history.filter((d) => d.journal).length > 0
                  ? (
                      history
                        .filter((d) => d.journal)
                        .reduce((a, d) => a + d.journal.score, 0) /
                      history.filter((d) => d.journal).length
                    ).toFixed(1)
                  : '—'
              }
              color="var(--success)"
              sub="last 7 days"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Week overview */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-2)' }}>
              This week
            </p>
            <div className="flex justify-between">
              {history.map((day) => {
                const pct = day.habitsTotal > 0 ? (day.habitsCompleted / day.habitsTotal) * 100 : 0
                const isToday = day.date === store.today
                return (
                  <div key={day.date} className="flex flex-col items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-mono font-medium"
                      style={{
                        background: pct === 100 ? 'var(--success-dim)' : pct > 0 ? 'var(--accent-dim)' : 'var(--surface-3)',
                        color: pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--accent)' : 'var(--text-3)',
                        border: isToday ? '1.5px solid var(--accent)' : '1px solid transparent',
                      }}
                    >
                      {day.habitsCompleted}
                    </div>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: isToday ? 'var(--accent)' : 'var(--text-3)' }}
                    >
                      {day.shortDate}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={() => store.exportToExcel()}
            className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
            }}
          >
            <Download size={16} />
            Export to Excel
          </button>
        </div>

      </div>
    </div>
  )
}
