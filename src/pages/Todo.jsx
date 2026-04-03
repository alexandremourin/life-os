import { useState } from 'react'
import { Plus, Trash2, Check, Archive, ArrowLeft, Flag, Calendar, AlertCircle } from 'lucide-react'

function formatDeadline(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.round((d - today) / 86400000)
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true }
  if (diff === 0) return { label: 'Today', overdue: false }
  if (diff === 1) return { label: 'Tomorrow', overdue: false }
  return { label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), overdue: false }
}

export default function Todo({ store }) {
  const [activeCategory, setActiveCategory] = useState('projects')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [showArchive, setShowArchive] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const handleAdd = async () => {
    if (!newTask.trim()) return
    const id = await store.addTodo(activeCategory, newTask.trim())
    if (newDesc.trim() && id) store.setTodoDescription(id, newDesc.trim())
    setNewTask('')
    setNewDesc('')
    setShowAddPanel(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
  }

  const activeTodos = store.todos[activeCategory] || []
  const activeColor = store.categories.find((c) => c.id === activeCategory)?.color || '#fff'

  // Sort pending: high priority first, then by deadline, then createdAt
  const pendingTodos = activeTodos.filter(t => !t.done).map(t => {
    const meta = store.getTodoMeta(t.id)
    return { ...t, meta }
  }).sort((a, b) => {
    if (a.meta.priority === 'high' && b.meta.priority !== 'high') return -1
    if (b.meta.priority === 'high' && a.meta.priority !== 'high') return 1
    if (a.meta.deadline && b.meta.deadline) return a.meta.deadline.localeCompare(b.meta.deadline)
    if (a.meta.deadline) return -1
    if (b.meta.deadline) return 1
    return 0
  })

  const doneTodos = activeTodos.filter(t => t.done)

  const completedByDate = {}
  Object.entries(store.todos).forEach(([catId, tasks]) => {
    tasks.filter((t) => t.done).forEach((t) => {
      const date = t.completedAt || t.createdAt || 'Unknown'
      if (!completedByDate[date]) completedByDate[date] = []
      const catInfo = store.categories.find((c) => c.id === catId)
      completedByDate[date].push({ ...t, category: catInfo?.label, categoryColor: catInfo?.color })
    })
  })
  const sortedDates = Object.keys(completedByDate).sort().reverse()
  const totalCompleted = Object.values(completedByDate).reduce((a, c) => a + c.length, 0)

  // Archive view
  if (showArchive) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setShowArchive(false)}
            style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>Completed</h1>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{totalCompleted} tasks</p>
          </div>
        </div>

        {sortedDates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--surface)', borderRadius: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No completed tasks yet</p>
          </div>
        )}

        {sortedDates.map((date) => (
          <div key={date}>
            <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {date === 'Unknown' ? 'Unknown date' : new Date(date).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {completedByDate[date].map((task) => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: task.categoryColor + '22' }}>
                    <Check size={12} style={{ color: task.categoryColor }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 14, minWidth: 0 }}>{task.text}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: task.categoryColor + '18', color: task.categoryColor, fontWeight: 500, flexShrink: 0 }}>
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Normal view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Tasks</p>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>Tasks</h1>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {store.categories.map((cat) => {
          const isActive = cat.id === activeCategory
          const catPending = (store.todos[cat.id] || []).filter((t) => !t.done).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                background: isActive ? cat.color + '18' : 'var(--surface)',
                color: isActive ? cat.color : 'var(--text-3)',
                transition: 'all 0.2s',
              }}
            >
              {cat.label}
              {catPending > 0 && (
                <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', padding: '1px 6px', borderRadius: 5, background: cat.color + '25', color: cat.color }}>
                  {catPending}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Add task panel */}
      {showAddPanel ? (
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }} className="fade-in">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task title..."
            style={{ padding: '11px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif' }}
            autoFocus
          />
          <textarea
            rows={2}
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)..."
            style={{ fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setShowAddPanel(false); setNewTask(''); setNewDesc('') }}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent', color: 'var(--text-3)', fontSize: 13, fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newTask.trim()}
              style={{
                flex: 2, padding: '10px 0', borderRadius: 10, border: 'none', cursor: newTask.trim() ? 'pointer' : 'not-allowed',
                background: newTask.trim() ? activeColor : 'var(--surface-2)',
                color: newTask.trim() ? '#ffffff' : 'var(--text-3)',
                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              }}
            >
              Add task
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddPanel(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 0', borderRadius: 12, border: '1px dashed var(--border)',
            background: 'transparent', cursor: 'pointer',
            fontSize: 13, color: 'var(--text-3)', fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = activeColor; e.currentTarget.style.color = activeColor }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)' }}
        >
          <Plus size={15} />
          Add task
        </button>
      )}

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {pendingTodos.length === 0 && doneTodos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--surface)', borderRadius: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No tasks yet</p>
          </div>
        )}

        {/* Pending */}
        {pendingTodos.map((todo) => {
          const isHigh = todo.meta.priority === 'high'
          const deadlineInfo = formatDeadline(todo.meta.deadline)
          const isExpanded = expandedId === todo.id

          return (
            <div key={todo.id} style={{ borderRadius: 12, background: 'var(--surface)', overflow: 'hidden' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px' }}
                className="todo-row"
              >
                {/* Complete */}
                <button
                  onClick={() => store.toggleTodo(activeCategory, todo.id)}
                  style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${isHigh ? 'var(--danger)' : activeColor + '50'}`,
                    background: 'transparent', cursor: 'pointer',
                  }}
                />

                {/* Text + deadline */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, display: 'block' }}>{todo.text}</span>
                  {deadlineInfo && (
                    <span style={{
                      fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                      color: deadlineInfo.overdue ? 'var(--danger)' : 'var(--text-3)',
                      display: 'flex', alignItems: 'center', gap: 3, marginTop: 2,
                    }}>
                      {deadlineInfo.overdue && <AlertCircle size={9} />}
                      {deadlineInfo.label}
                    </span>
                  )}
                </div>

                {/* Priority flag */}
                <button
                  onClick={() => store.setTodoPriority(todo.id, isHigh ? 'normal' : 'high')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: isHigh ? 'var(--danger)' : 'var(--text-3)',
                    opacity: isHigh ? 1 : 0.4,
                    transition: 'all 0.2s',
                  }}
                >
                  <Flag size={13} fill={isHigh ? 'var(--danger)' : 'none'} />
                </button>

                {/* Calendar toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : todo.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: todo.meta.deadline ? 'var(--accent)' : 'var(--text-3)',
                    opacity: todo.meta.deadline ? 1 : 0.4,
                    transition: 'all 0.2s',
                  }}
                >
                  <Calendar size={13} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => store.deleteTodo(activeCategory, todo.id)}
                  style={{ color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.4, transition: 'opacity 0.2s' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expanded: priority + deadline controls */}
              {isExpanded && (
                <div style={{ padding: '0 14px 13px', display: 'flex', flexDirection: 'column', gap: 10 }} className="fade-in">
                  <textarea
                    rows={2}
                    value={todo.meta.description || ''}
                    onChange={e => store.setTodoDescription(todo.id, e.target.value)}
                    placeholder="Add a description..."
                    style={{ fontSize: 13, resize: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => store.setTodoPriority(todo.id, isHigh ? 'normal' : 'high')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                        borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500,
                        background: isHigh ? 'var(--danger-dim)' : 'var(--surface-2)',
                        color: isHigh ? 'var(--danger)' : 'var(--text-3)', transition: 'all 0.2s',
                      }}
                    >
                      <Flag size={11} fill={isHigh ? 'var(--danger)' : 'none'} />
                      {isHigh ? 'High priority' : 'Set priority'}
                    </button>
                    <input
                      type="date"
                      value={todo.meta.deadline || ''}
                      onChange={(e) => store.setTodoDeadline(todo.id, e.target.value || null)}
                      style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}
                    />
                    {todo.meta.deadline && (
                      <button onClick={() => store.setTodoDeadline(todo.id, null)} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, background: 'var(--surface-2)', color: 'var(--text-3)' }}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Done today */}
        {doneTodos.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Done</p>
            {doneTodos.slice(0, 3).map((todo) => (
              <div key={todo.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', opacity: 0.4, marginBottom: 4 }}
              >
                <button
                  onClick={() => store.toggleTodo(activeCategory, todo.id)}
                  style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: activeColor + '30', border: `1.5px solid ${activeColor}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Check size={11} style={{ color: activeColor }} />
                </button>
                <span style={{ flex: 1, fontSize: 14, textDecoration: 'line-through', color: 'var(--text-3)' }}>{todo.text}</span>
                <button
                  onClick={() => store.deleteTodo(activeCategory, todo.id)}
                  style={{ color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archive button */}
      <button
        onClick={() => setShowArchive(true)}
        style={{
          width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'var(--surface)', color: 'var(--text-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 13, fontWeight: 500, transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
      >
        <Archive size={14} />
        Completed tasks
        {totalCompleted > 0 && (
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', padding: '2px 6px', borderRadius: 5, background: 'var(--accent-dim)', color: 'var(--accent)' }}>
            {totalCompleted}
          </span>
        )}
      </button>
    </div>
  )
}
