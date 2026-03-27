import { Check } from 'lucide-react'

export default function Habits({ store }) {
  const todayHabits = store.getTodayHabits()
  const completion = store.getCompletionRate()
  const doneCount = Object.values(todayHabits).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Habits</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: completion === 100 ? 'var(--success-dim)' : 'var(--accent-dim)',
            border: `1px solid ${completion === 100 ? 'var(--success)' : 'var(--accent)'}`,
          }}
        >
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: completion === 100 ? 'var(--success)' : 'var(--accent)' }}
          >
            {doneCount}/{store.habits.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full" style={{ background: 'var(--surface-3)' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${completion}%`,
            background: completion === 100 ? 'var(--success)' : 'var(--accent)',
          }}
        />
      </div>

      {/* Habits list */}
      <div className="space-y-2">
        {store.habits.map((habit) => {
          const checked = !!todayHabits[habit.id]
          return (
            <button
              key={habit.id}
              onClick={() => store.toggleHabit(habit.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98]"
              style={{
                background: checked ? 'var(--success-dim)' : 'var(--surface)',
                border: `1px solid ${checked ? 'var(--success)' : 'var(--border)'}`,
              }}
            >
              {/* Check circle */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  background: checked ? 'var(--success)' : 'transparent',
                  border: checked ? 'none' : '2px solid var(--border)',
                }}
              >
                {checked && <Check size={16} color="#0a0a0a" strokeWidth={3} />}
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <span
                  className="text-[15px] font-medium transition-all duration-200"
                  style={{
                    color: checked ? 'var(--success)' : 'var(--text)',
                    textDecoration: checked ? 'line-through' : 'none',
                    opacity: checked ? 0.8 : 1,
                  }}
                >
                  {habit.icon} {habit.label}
                </span>
              </div>

              {/* Target */}
              <span
                className="text-xs font-mono px-2 py-1 rounded-md"
                style={{
                  background: 'var(--surface-3)',
                  color: 'var(--text-3)',
                }}
              >
                {habit.target}
              </span>
            </button>
          )
        })}
      </div>

      {/* Smoke streak callout */}
      {store.smokeStreak > 0 && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)' }}
        >
          <span className="text-2xl">🚭</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
              {store.smokeStreak} day streak
            </p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Keep going, you're doing great
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
