import { useState, useEffect } from 'react'
import { Save, ChevronDown, ChevronUp } from 'lucide-react'

export default function Journal({ store }) {
  const todayJournal = store.getTodayJournal()
  const [score, setScore] = useState(todayJournal.score)
  const [positive, setPositive] = useState(todayJournal.positive)
  const [negative, setNegative] = useState(todayJournal.negative)
  const [saved, setSaved] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const history = store.getJournalHistory()

  useEffect(() => {
    const j = store.getTodayJournal()
    setScore(j.score)
    setPositive(j.positive)
    setNegative(j.negative)
  }, [store.today])

  const handleSave = () => {
    store.saveJournal(score, positive, negative)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const getScoreColor = (s) => {
    if (s >= 8) return 'var(--success)'
    if (s >= 5) return 'var(--accent)'
    return 'var(--danger)'
  }

  const getScoreEmoji = (s) => {
    if (s >= 9) return '🔥'
    if (s >= 7) return '😊'
    if (s >= 5) return '😐'
    if (s >= 3) return '😕'
    return '😞'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Journal</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Score */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            Rate your day
          </span>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{getScoreEmoji(score)}</span>
            <span
              className="text-3xl font-bold font-mono"
              style={{ color: getScoreColor(score) }}
            >
              {score}
            </span>
            <span className="text-lg" style={{ color: 'var(--text-3)' }}>
              /10
            </span>
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>Rough</span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>Perfect</span>
        </div>
      </div>

      {/* Positive */}
      <div>
        <label className="text-sm font-medium flex items-center gap-2 mb-2" style={{ color: 'var(--success)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
          What went well
        </label>
        <textarea
          rows={3}
          value={positive}
          onChange={(e) => setPositive(e.target.value)}
          placeholder="Best moment of the day..."
        />
      </div>

      {/* Negative */}
      <div>
        <label className="text-sm font-medium flex items-center gap-2 mb-2" style={{ color: 'var(--danger)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--danger)' }} />
          What to improve
        </label>
        <textarea
          rows={3}
          value={negative}
          onChange={(e) => setNegative(e.target.value)}
          placeholder="What could have been better..."
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
        style={{
          background: saved ? 'var(--success)' : 'var(--accent)',
          color: '#0a0a0a',
        }}
      >
        <Save size={16} />
        {saved ? 'Saved!' : 'Save entry'}
      </button>

      {/* History */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            Past entries
          </span>
          {historyOpen ? (
            <ChevronUp size={16} style={{ color: 'var(--text-3)' }} />
          ) : (
            <ChevronDown size={16} style={{ color: 'var(--text-3)' }} />
          )}
        </button>

        {historyOpen && (
          <div className="px-4 pb-4 space-y-3">
            {history
              .filter((d) => d.journal && d.date !== store.today)
              .reverse()
              .map((day) => (
                <div
                  key={day.date}
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--surface-2)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                      {new Date(day.date).toLocaleDateString('en', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span
                      className="text-sm font-mono font-semibold"
                      style={{ color: getScoreColor(day.journal.score) }}
                    >
                      {day.journal.score}/10
                    </span>
                  </div>
                  {day.journal.positive && (
                    <p className="text-xs mb-1">
                      <span style={{ color: 'var(--success)' }}>+</span>{' '}
                      <span style={{ color: 'var(--text-2)' }}>{day.journal.positive}</span>
                    </p>
                  )}
                  {day.journal.negative && (
                    <p className="text-xs">
                      <span style={{ color: 'var(--danger)' }}>−</span>{' '}
                      <span style={{ color: 'var(--text-2)' }}>{day.journal.negative}</span>
                    </p>
                  )}
                </div>
              ))}
            {history.filter((d) => d.journal && d.date !== store.today).length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-3)' }}>
                No past entries yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
