import { useState } from 'react'
import { Check, Lock, History, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'

// Vue historique
function HistoryView({ store, onBack }) {
  const history = store.getHabitsHistory(30)
  const [expandedDay, setExpandedDay] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Habits History</h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Last 30 days</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {history.map((day) => {
          const pct = Math.round((day.completed / day.total) * 100)
          const isExpanded = expandedDay === day.date
          return (
            <div key={day.date} style={{ background: 'var(--surface)', borderRadius: 12, overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                }}
              >
                {/* Date */}
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                  color: day.isToday ? 'var(--accent)' : 'var(--text-3)',
                  width: 90, textAlign: 'left', flexShrink: 0,
                }}>
                  {day.isToday ? 'Today' : day.label}
                </span>

                {/* Progress bar */}
                <div style={{ flex: 1, height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${pct}%`,
                    background: pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--accent)' : 'var(--surface-3)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>

                {/* Score */}
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600,
                  color: pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--accent)' : 'var(--text-3)',
                  width: 36, textAlign: 'right', flexShrink: 0,
                }}>
                  {day.completed}/{day.total}
                </span>

                {isExpanded
                  ? <ChevronUp size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  : <ChevronDown size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                }
              </button>

              {/* Expanded habit list */}
              {isExpanded && (
                <div style={{ padding: '0 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {day.habits.map((h) => (
                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        background: h.done ? 'var(--success)' : 'var(--surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {h.done && <Check size={9} color="#0a0a0a" strokeWidth={3} />}
                      </div>
                      <span style={{
                        fontSize: 12,
                        color: h.done ? 'var(--text-2)' : 'var(--text-3)',
                        textDecoration: h.done ? 'none' : 'line-through',
                      }}>
                        {h.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Vue principale
export default function Habits({ store }) {
  const [showHistory, setShowHistory] = useState(false)

  if (showHistory) return <HistoryView store={store} onBack={() => setShowHistory(false)} />

  const todayHabits = store.getTodayHabits()
  const completion = store.getCompletionRate()
  const doneCount = Object.values(todayHabits).filter(Boolean).length
  const isValidated = store.isDayValidated()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 600 }}>Habits</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isValidated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--success-dim)' }}>
              <Lock size={12} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Validated</span>
            </div>
          )}
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, color: completion === 100 ? 'var(--success)' : 'var(--accent)' }}>
            {doneCount}/{store.habits.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${completion}%`, borderRadius: 2,
          background: completion === 100 ? 'var(--success)' : 'var(--accent)',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Habits list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {store.habits.map((habit) => {
          const checked = !!todayHabits[habit.id]
          const streak = store.getHabitStreak(habit.id)
          return (
            <button
              key={habit.id}
              onClick={() => !isValidated && store.toggleHabit(habit.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 16px', borderRadius: 12, border: 'none',
                cursor: isValidated ? 'default' : 'pointer',
                background: checked ? 'var(--success-dim)' : 'var(--surface)',
                transition: 'all 0.2s',
                opacity: isValidated && !checked ? 0.5 : 1,
              }}
            >
              {/* Check circle */}
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
                opacity: checked ? 0.75 : 1,
                transition: 'all 0.2s',
              }}>
                {habit.label}
              </span>

              {/* Streak badge */}
              {streak > 1 && (
                <span style={{
                  fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                  padding: '2px 7px', borderRadius: 6,
                  background: 'var(--accent-dim)', color: 'var(--accent)',
                }}>
                  {streak}d
                </span>
              )}

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

      {/* Smoke streak callout */}
      {store.smokeStreak > 0 && (
        <div style={{
          borderRadius: 12, padding: '13px 18px',
          background: 'var(--danger-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--danger)' }}>Smoke-free streak</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: 'var(--danger)' }}>
            {store.smokeStreak}d
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Validate button */}
        {!isValidated ? (
          <button
            onClick={store.validateDay}
            disabled={doneCount === 0}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 12, border: 'none',
              cursor: doneCount === 0 ? 'not-allowed' : 'pointer',
              background: doneCount === 0 ? 'var(--surface)' : 'var(--accent)',
              color: doneCount === 0 ? 'var(--text-3)' : '#0a0a0a',
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
              opacity: doneCount === 0 ? 0.5 : 1,
            }}
          >
            <Lock size={14} />
            Validate day
          </button>
        ) : (
          <div style={{
            flex: 1, padding: '13px 0', borderRadius: 12,
            background: 'var(--success-dim)',
            fontSize: 13, fontWeight: 600, color: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Check size={14} />
            Day validated
          </div>
        )}

        {/* History button */}
        <button
          onClick={() => setShowHistory(true)}
          style={{
            width: 46, height: 46, borderRadius: 12, border: 'none',
            cursor: 'pointer', background: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-3)', transition: 'background 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
        >
          <History size={16} />
        </button>
      </div>
    </div>
  )
}
