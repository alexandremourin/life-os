import { useState } from 'react'
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react'

export default function Notes({ store }) {
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const handleAdd = () => {
    const t = newNote.trim()
    if (!t) return
    store.addNote(t)
    setNewNote('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  const startEdit = (note) => {
    setEditingId(note.id)
    setEditText(note.text)
  }

  const confirmEdit = () => {
    if (editText.trim()) {
      store.updateNote(editingId, editText.trim())
    }
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const notes = store.notes || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Quick capture</p>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>Notes</h1>
      </div>

      {/* Add note */}
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <textarea
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a note... (Enter to save)"
          style={{ fontSize: 14, resize: 'none' }}
        />
        <button
          onClick={handleAdd}
          disabled={!newNote.trim()}
          style={{
            alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: newNote.trim() ? 'pointer' : 'default',
            background: newNote.trim() ? 'var(--accent)' : 'var(--surface-2)',
            color: newNote.trim() ? '#0a0a0a' : 'var(--text-3)',
            fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
          }}
        >
          <Plus size={13} strokeWidth={2.5} />
          Add note
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--surface)', borderRadius: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No notes yet</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...notes].reverse().map((note) => (
          <div key={note.id} style={{ background: 'var(--surface)', borderRadius: 12, padding: '14px 16px' }} className="todo-row">
            {editingId === note.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit() }}
                  style={{ fontSize: 14, resize: 'none' }}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={cancelEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text-3)', fontSize: 12 }}>
                    <X size={11} /> Cancel
                  </button>
                  <button onClick={confirmEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', background: 'var(--success)', color: '#0a0a0a', fontSize: 12, fontWeight: 600 }}>
                    <Check size={11} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <p style={{ flex: 1, fontSize: 14, lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {note.text}
                </p>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(note)}
                    className="delete-btn"
                    style={{ color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, opacity: 0, transition: 'opacity 0.2s' }}
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => store.deleteNote(note.id)}
                    className="delete-btn"
                    style={{ color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, opacity: 0, transition: 'opacity 0.2s' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
            <p style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'JetBrains Mono, monospace', marginTop: 8 }}>
              {new Date(note.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
