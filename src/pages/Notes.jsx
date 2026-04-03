import { useState } from 'react'
import { Plus, Trash2, X, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'idea', label: 'Idea' },
  { id: 'project', label: 'Project' },
  { id: 'learning', label: 'Learning' },
  { id: 'tcs', label: 'TCS' },
  { id: 'personal', label: 'Personal' },
]

const STAGES = [
  { id: 'all', label: 'All' },
  { id: 'raw', label: 'RAW' },
  { id: 'building', label: 'BUILDING' },
  { id: 'ready', label: 'READY' },
  { id: 'paused', label: 'PAUSED' },
  { id: 'done', label: 'DONE' },
]

const STAGE_COLORS = {
  raw: { color: 'var(--text-3)', bg: 'var(--surface-2)' },
  building: { color: 'var(--accent)', bg: 'var(--accent-dim)' },
  ready: { color: 'var(--success)', bg: 'var(--success-dim)' },
  paused: { color: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
  done: { color: 'var(--text-3)', bg: 'var(--surface-2)' },
}

const PRIORITY_COLORS = {
  high: 'var(--danger)',
  normal: 'var(--text-3)',
  low: 'var(--surface-3)',
}

function NoteDetail({ note, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState(note.title || '')
  const [text, setText] = useState(note.text || '')
  const [category, setCategory] = useState(note.category || 'idea')
  const [stage, setStage] = useState(note.stage || 'raw')
  const [priority, setPriority] = useState(note.priority || 'normal')

  const save = () => {
    onUpdate(note.id, { title, text, category, stage, priority })
    onClose()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={save}
          style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          <X size={16} style={{ color: 'var(--text-2)' }} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 600, flex: 1 }}>Edit idea</h1>
        <button
          onClick={() => { onDelete(note.id); onClose() }}
          style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--danger-dim)', border: 'none', cursor: 'pointer' }}
        >
          <Trash2 size={15} style={{ color: 'var(--danger)' }} />
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title..."
        style={{ width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600 }}
      />

      {/* Content */}
      <textarea
        rows={6}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Develop your idea..."
        style={{ fontSize: 14 }}
      />

      {/* Category */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Category</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.filter(c => c.id !== 'all').map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid',
              borderColor: category === c.id ? 'var(--accent)' : 'var(--border)',
              background: category === c.id ? 'var(--accent-dim)' : 'var(--surface)',
              color: category === c.id ? 'var(--accent)' : 'var(--text-3)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            }}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Stage */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Stage</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STAGES.filter(s => s.id !== 'all').map(s => {
            const sc = STAGE_COLORS[s.id]
            return (
              <button key={s.id} onClick={() => setStage(s.id)} style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid',
                borderColor: stage === s.id ? sc.color : 'var(--border)',
                background: stage === s.id ? sc.bg : 'var(--surface)',
                color: stage === s.id ? sc.color : 'var(--text-3)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}>{s.label}</button>
            )
          })}
        </div>
      </div>

      {/* Priority */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Priority</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {['high', 'normal', 'low'].map(p => (
            <button key={p} onClick={() => setPriority(p)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 8, border: '1px solid',
              borderColor: priority === p ? PRIORITY_COLORS[p] : 'var(--border)',
              background: priority === p ? (p === 'high' ? 'var(--danger-dim)' : 'var(--surface-2)') : 'var(--surface)',
              color: priority === p ? PRIORITY_COLORS[p] : 'var(--text-3)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[p], flexShrink: 0 }} />
              {p}
            </button>
          ))}
        </div>
      </div>

      <button onClick={save} style={{
        width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: 'var(--accent)', color: '#ffffff', fontSize: 13, fontWeight: 600,
        transition: 'opacity 0.2s',
      }}>
        Save
      </button>
    </div>
  )
}

export default function Notes({ store }) {
  const [filterCat, setFilterCat] = useState('all')
  const [filterStage, setFilterStage] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState('idea')
  const [newStage, setNewStage] = useState('raw')
  const [newPriority, setNewPriority] = useState('normal')

  const notes = store.notes || []

  const filtered = notes.filter(n => {
    const cat = filterCat === 'all' || (n.category || 'idea') === filterCat
    const stg = filterStage === 'all' || (n.stage || 'raw') === filterStage
    return cat && stg
  })

  const handleAdd = () => {
    if (!newTitle.trim() && !newText.trim()) return
    store.addNote({ title: newTitle.trim(), text: newText.trim(), category: newCategory, stage: newStage, priority: newPriority })
    setNewTitle(''); setNewText(''); setNewCategory('idea'); setNewStage('raw'); setNewPriority('normal')
    setShowNew(false)
  }

  if (selectedNote) {
    return (
      <NoteDetail
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onUpdate={store.updateNote}
        onDelete={store.deleteNote}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Ideas & notes</p>
          <h1 style={{ fontSize: 26, fontWeight: 600 }}>Ideas</h1>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--accent)', color: '#ffffff',
            fontSize: 13, fontWeight: 600, transition: 'opacity 0.2s',
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          New
        </button>
      </div>

      {/* New idea form */}
      {showNew && (
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-in">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Title..."
            autoFocus
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}
          />
          <textarea
            rows={3}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Details... (optional)"
            style={{ fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
              {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select value={newStage} onChange={e => setNewStage(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
              {STAGES.filter(s => s.id !== 'all').map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
            <button onClick={handleAdd} style={{
              marginLeft: 'auto', padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'var(--accent)', color: '#ffffff', fontSize: 12, fontWeight: 600,
            }}>Add</button>
            <button onClick={() => setShowNew(false)} style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer',
              background: 'var(--surface)', color: 'var(--text-3)', fontSize: 12,
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 8,
              border: '1px solid', borderColor: filterCat === c.id ? 'var(--accent)' : 'var(--border)',
              background: filterCat === c.id ? 'var(--accent-dim)' : 'var(--surface)',
              color: filterCat === c.id ? 'var(--accent)' : 'var(--text-3)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            }}>{c.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {STAGES.map(s => {
            const sc = s.id !== 'all' ? STAGE_COLORS[s.id] : null
            return (
              <button key={s.id} onClick={() => setFilterStage(s.id)} style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: 8,
                border: '1px solid', borderColor: filterStage === s.id ? (sc?.color || 'var(--accent)') : 'var(--border)',
                background: filterStage === s.id ? (sc?.bg || 'var(--accent-dim)') : 'var(--surface)',
                color: filterStage === s.id ? (sc?.color || 'var(--accent)') : 'var(--text-3)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.03em',
                transition: 'all 0.15s',
              }}>{s.label}</button>
            )
          })}
        </div>
      </div>

      {/* Notes list */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {notes.length === 0 ? 'No ideas yet' : 'No ideas match these filters'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((note) => {
          const sc = STAGE_COLORS[note.stage || 'raw']
          const cat = CATEGORIES.find(c => c.id === (note.category || 'idea'))
          const title = note.title || note.text?.split('\n')[0]?.slice(0, 50) || 'Untitled'
          const preview = note.title ? (note.text?.slice(0, 80) || '') : (note.text?.slice(50, 130) || '')

          return (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note)}
              style={{
                width: '100%', textAlign: 'left',
                background: 'var(--surface)', borderRadius: 14,
                border: '1px solid var(--border)',
                padding: '14px 16px',
                cursor: 'pointer', transition: 'border-color 0.2s',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Priority dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                background: PRIORITY_COLORS[note.priority || 'normal'],
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: preview ? 6 : 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{title}</span>
                  <span style={{
                    flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                    padding: '2px 8px', borderRadius: 6,
                    color: sc.color, background: sc.bg,
                  }}>{(note.stage || 'raw').toUpperCase()}</span>
                </div>
                {preview && (
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 8 }}>
                    {preview}{preview.length >= 80 ? '...' : ''}
                  </p>
                )}
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 6,
                  background: 'var(--surface-2)', color: 'var(--text-3)', fontWeight: 500,
                }}>{cat?.label || 'Idea'}</span>
              </div>

              <ChevronRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 3 }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
