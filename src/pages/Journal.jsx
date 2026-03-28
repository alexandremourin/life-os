import { useState, useEffect } from 'react'
import { Save, ChevronDown, ChevronUp, Search, X } from 'lucide-react'

export default function Journal({ store }) {
  const todayJournal = store.getTodayJournal()
  const [score, setScore] = useState(todayJournal.score)
  const [positive, setPositive] = useState(todayJournal.positive)
  const [negative, setNegative] = useState(todayJournal.negative)
  const [saved, setSaved] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [search, setSearch] = useState('')

  const allEntries = store.getAllJournalEntries()
  const pastEntries = allEntries.filter(e => e.date !== store.today)
  const filteredEntries = search.trim()
    ? pastEntries.filter(e =>
        e.positive?.toLowerCase().includes(search.toLowerCase()) ||
        e.negative?.toLowerCase().includes(search.toLowerCase())
      )
    : pastEntries

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

  // Score /5 : normalise les anciennes valeurs /10
  const normalizeScore = (s) => s > 5 ? Math.round(s / 2) : s

  const getScoreColor = (s) => {
    const n = normalizeScore(s)
    if (n >= 4) return 'var(--success)'
    if (n >= 3) return 'var(--accent)'
    return 'var(--danger)'
  }

  const displayScore = normalizeScore(score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>Journal</h1>
      </div>

      {/* Score /5 */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rate your day</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 30, fontWeight: 700, color: getScoreColor(score) }}>
            {displayScore}<span style={{ fontSize: 16, color: 'var(--text-3)' }}>/5</span>
          </span>
        </div>
        <input type="range" min="1" max="5" value={Math.min(score, 5)} onChange={(e) => setScore(parseInt(e.target.value))} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)' }}>Rough</span>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)' }}>Perfect</span>
        </div>
      </div>

      {/* Positive */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          What went well
        </label>
        <textarea rows={3} value={positive} onChange={(e) => setPositive(e.target.value)} placeholder="Best moment of the day..." />
      </div>

      {/* Negative */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          What to improve
        </label>
        <textarea rows={3} value={negative} onChange={(e) => setNegative(e.target.value)} placeholder="What could have been better..." />
      </div>

      <button onClick={handleSave} style={{
        width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: saved ? 'var(--success)' : 'var(--accent)',
        color: '#0a0a0a', fontSize: 13, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.3s',
      }}>
        <Save size={15} />
        {saved ? 'Saved' : 'Save entry'}
      </button>

      {/* Historique complet */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, overflow: 'hidden' }}>
        <button onClick={() => setHistoryOpen(!historyOpen)} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '15px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>Past entries</span>
            {pastEntries.length > 0 && (
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', padding: '2px 7px', borderRadius: 6, background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                {pastEntries.length}
              </span>
            )}
          </div>
          {historyOpen ? <ChevronUp size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />}
        </button>

        {historyOpen && (
          <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }} className="fade-in">
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                style={{ width: '100%', padding: '9px 30px 9px 30px', borderRadius: 8, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {filteredEntries.length === 0 && (
              <p style={{ fontSize: 12, textAlign: 'center', padding: '14px 0', color: 'var(--text-3)' }}>
                {search ? 'No results' : 'No past entries'}
              </p>
            )}

            {filteredEntries.map((entry) => {
              const s = normalizeScore(entry.score)
              return (
                <div key={entry.date} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: entry.positive || entry.negative ? 8 : 0 }}>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)' }}>{entry.shortLabel}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: getScoreColor(entry.score) }}>{s}/5</span>
                  </div>
                  {entry.positive && <p style={{ fontSize: 12, marginBottom: entry.negative ? 4 : 0 }}><span style={{ color: 'var(--success)', marginRight: 5 }}>+</span><span style={{ color: 'var(--text-2)' }}>{entry.positive}</span></p>}
                  {entry.negative && <p style={{ fontSize: 12 }}><span style={{ color: 'var(--danger)', marginRight: 5 }}>−</span><span style={{ color: 'var(--text-2)' }}>{entry.negative}</span></p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
