import { useState } from 'react'
import { Check, Lock, History, ArrowLeft, ChevronDown, ChevronUp, Plus, X, Trash2 } from 'lucide-react'

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
                    <button
                      key={h.id}
                      onClick={(e) => { e.stopPropagation(); store.toggleHabitForDate(day.date, h.id) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        background: h.done ? 'var(--success)' : 'var(--surface-2)',
                        border: h.done ? 'none' : '1.5px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}>
                        {h.done && <Check size={9} color="#ffffff" strokeWidth={3} />}
                      </div>
                      <span style={{
                        fontSize: 12,
                        color: h.done ? 'var(--text-2)' : 'var(--text-3)',
                        textDecoration: h.done ? 'none' : 'line-through',
                      }}>
                        {h.label}
                      </span>
                    </button>
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newTarget, setNewTarget] = useState('')

  const handleAddHabit = () => {
    if (!newLabel.trim()) return
    store.addCustomHabit(newLabel.trim(), newTarget.trim() || 'daily')
    setNewLabel('')
    setNewTarget('')
    setShowAddForm(false)
  }

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
          <h1 style={{ fontSize: 26, fontWeight: 600 }}>Daily Habits</h1>
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
                {checked && <Check size={13} color="#ffffff" strokeWidth={3} />}
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
              {streak > 0 && (
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

              {/* Remove custom habit */}
              {habit.custom && !isValidated && (
                <button
                  onClick={e => { e.stopPropagation(); store.removeCustomHabit(habit.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)', opacity: 0.4, flexShrink: 0 }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </button>
          )
        })}
      </div>

      {/* Smoke streak callout */}
      {store.smokeStreak > 0 && (
        <div style={{
          borderRadius: 12, padding: '13px 18px',
          background: 'var(--success-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--success)' }}>Smoke-free streak</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: 'var(--success)' }}>
            {store.smokeStreak}d
          </span>
        </div>
      )}

      {/* Add habit form */}
      {showAddForm ? (
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }} className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>New habit</span>
            <button onClick={() => { setShowAddForm(false); setNewLabel(''); setNewTarget('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
              <X size={14} />
            </button>
          </div>
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
            placeholder="Habit name..."
            style={{ padding: '10px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif' }}
            autoFocus
          />
          <input
            type="text"
            value={newTarget}
            onChange={e => setNewTarget(e.target.value)}
            placeholder="Target (e.g. 30 min, daily...)"
            style={{ padding: '10px 14px', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
          />
          <button
            onClick={handleAddHabit}
            disabled={!newLabel.trim()}
            style={{
              padding: '11px 0', borderRadius: 10, border: 'none', cursor: newLabel.trim() ? 'pointer' : 'not-allowed',
              background: newLabel.trim() ? 'var(--accent)' : 'var(--surface-2)',
              color: newLabel.trim() ? '#ffffff' : 'var(--text-3)',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            Add habit
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 0', borderRadius: 10, border: '1px dashed var(--border)',
            background: 'transparent', cursor: 'pointer',
            fontSize: 12, color: 'var(--text-3)', fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)' }}
        >
          <Plus size={13} />
          Add habit
        </button>
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
              color: doneCount === 0 ? 'var(--text-3)' : '#ffffff',
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
            padding: '13px 16px', borderRadius: 12, border: 'none',
            cursor: 'pointer', background: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: 'var(--text-3)', transition: 'background 0.2s', flexShrink: 0,
            fontSize: 13, fontWeight: 500,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
        >
          <History size={15} />
          History
        </button>
      </div>
    </div>
  )
}
