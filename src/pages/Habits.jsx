import { Check } from 'lucide-react'

export default function Habits({ store }) {
  const todayHabits = store.getTodayHabits()
  const completion = store.getCompletionRate()
  const doneCount = Object.values(todayHabits).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 600 }}>Habits</h1>
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14, fontWeight: 600,
          color: completion === 100 ? 'var(--success)' : 'var(--accent)',
        }}>
          {doneCount}/{store.habits.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${completion}%`,
          borderRadius: 2,
          background: completion === 100 ? 'var(--success)' : 'var(--accent)',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Habits list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {store.habits.map((habit) => {
          const checked = !!todayHabits[habit.id]
          return (
            <button
              key={habit.id}
              onClick={() => store.toggleHabit(habit.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: checked ? 'var(--success-dim)' : 'var(--surface)',
                transition: 'all 0.2s',
              }}
            >
              {/* Check */}
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: checked ? 'var(--success)' : 'transparent',
                border: checked ? 'none' : '1.5px solid var(--surface-3)',
                transition: 'all 0.2s',
              }}>
                {checked && <Check size={13} color="#0a0a0a" strokeWidth={3} />}
              </div>

              {/* Label */}
              <span style={{
                flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 500,
                color: checked ? 'var(--success)' : 'var(--text)',
                textDecoration: checked ? 'line-through' : 'none',
                opacity: checked ? 0.7 : 1,
                transition: 'all 0.2s',
              }}>
                {habit.label}
              </span>

              {/* Target */}
              <span style={{
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--text-3)', padding: '3px 8px',
                background: 'var(--surface-2)', borderRadius: 6,
              }}>
                {habit.target}
              </span>
            </button>
          )
        })}
      </div>

      {/* Smoke streak */}
      {store.smokeStreak > 0 && (
        <div style={{
          borderRadius: 12, padding: '14px 18px',
          background: 'var(--danger-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--danger)' }}>
            Smoke-free streak
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: 'var(--danger)' }}>
            {store.smokeStreak}d
          </span>
        </div>
      )}
    </div>
  )
}
