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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>Journal</h1>
      </div>

      {/* Score */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rate your day</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: getScoreColor(score) }}>
            {score}<span style={{ fontSize: 16, color: 'var(--text-3)' }}>/10</span>
          </span>
        </div>
        <input type="range" min="1" max="10" value={score} onChange={(e) => setScore(parseInt(e.target.value))} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)' }}>Rough</span>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)' }}>Perfect</span>
        </div>
      </div>

      {/* Positive */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          What went well
        </label>
        <textarea rows={3} value={positive} onChange={(e) => setPositive(e.target.value)} placeholder="Best moment of the day..." />
      </div>

      {/* Negative */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          What to improve
        </label>
        <textarea rows={3} value={negative} onChange={(e) => setNegative(e.target.value)} placeholder="What could have been better..." />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: saved ? 'var(--success)' : 'var(--accent)',
          color: '#0a0a0a', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.2s',
        }}
      >
        <Save size={15} />
        {saved ? 'Saved' : 'Save entry'}
      </button>

      {/* History */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, overflow: 'hidden' }}>
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>Past entries</span>
          {historyOpen
            ? <ChevronUp size={15} style={{ color: 'var(--text-3)' }} />
            : <ChevronDown size={15} style={{ color: 'var(--text-3)' }} />}
        </button>

        {historyOpen && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.filter(d => d.journal && d.date !== store.today).reverse().map((day) => (
              <div key={day.date} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)' }}>
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: getScoreColor(day.journal.score) }}>
                    {day.journal.score}/10
                  </span>
                </div>
                {day.journal.positive && (
                  <p style={{ fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--success)', marginRight: 6 }}>+</span>
                    <span style={{ color: 'var(--text-2)' }}>{day.journal.positive}</span>
                  </p>
                )}
                {day.journal.negative && (
                  <p style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--danger)', marginRight: 6 }}>−</span>
                    <span style={{ color: 'var(--text-2)' }}>{day.journal.negative}</span>
                  </p>
                )}
              </div>
            ))}
            {history.filter(d => d.journal && d.date !== store.today).length === 0 && (
              <p style={{ fontSize: 12, textAlign: 'center', padding: '16px 0', color: 'var(--text-3)' }}>No past entries yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
