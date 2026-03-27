import { useState } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronUp, Archive, ArrowLeft } from 'lucide-react'

export default function Todo({ store }) {
  const [activeCategory, setActiveCategory] = useState('tcs')
  const [newTask, setNewTask] = useState('')
  const [showArchive, setShowArchive] = useState(false)

  const handleAdd = () => {
    if (!newTask.trim()) return
    store.addTodo(activeCategory, newTask.trim())
    setNewTask('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  const activeTodos = store.todos[activeCategory] || []
  const activeColor = store.categories.find((c) => c.id === activeCategory)?.color || '#fff'

  // Group completed tasks by date
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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchive(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={18} style={{ color: 'var(--text-2)' }} />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Completed tasks</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
              {totalCompleted} tasks completed
            </p>
          </div>
        </div>

        {sortedDates.length === 0 && (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              No completed tasks yet
            </p>
          </div>
        )}

        {sortedDates.map((date) => (
          <div key={date}>
            <p className="text-xs font-mono font-medium mb-2 px-1" style={{ color: 'var(--text-3)' }}>
              {date === 'Unknown'
                ? 'Unknown date'
                : new Date(date).toLocaleDateString('en', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
            </p>
            <div className="space-y-2">
              {completedByDate[date].map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: task.categoryColor + '33', border: `2px solid ${task.categoryColor}` }}
                  >
                    <Check size={14} style={{ color: task.categoryColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[15px] block">{task.text}</span>
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-1 rounded-md shrink-0"
                    style={{ background: task.categoryColor + '22', color: task.categoryColor }}
                  >
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">To-do</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
          {store.getPendingTodos()} tasks pending
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {store.categories.map((cat) => {
          const isActive = cat.id === activeCategory
          const catPending = (store.todos[cat.id] || []).filter((t) => !t.done).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: isActive ? cat.color + '22' : 'var(--surface)',
                border: `1px solid ${isActive ? cat.color : 'var(--border)'}`,
                color: isActive ? cat.color : 'var(--text-2)',
              }}
            >
              {cat.label}
              {catPending > 0 && (
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                  style={{ background: cat.color + '33', color: cat.color }}
                >
                  {catPending}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Add task input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onFocus={(e) => (e.target.style.borderColor = activeColor)}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          onClick={handleAdd}
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95"
          style={{ background: activeColor, color: '#0a0a0a' }}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {activeTodos.filter((t) => !t.done).length === 0 && activeTodos.filter((t) => t.done).length === 0 && (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              No tasks yet
            </p>
          </div>
        )}

        {/* Pending tasks */}
        {activeTodos
          .filter((t) => !t.done)
          .map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-4 rounded-2xl group"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => store.toggleTodo(activeCategory, todo.id)}
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                style={{ border: `2px solid ${activeColor}40` }}
              />
              <span className="flex-1 text-[15px]">{todo.text}</span>
              <button
                onClick={() => store.deleteTodo(activeCategory, todo.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                style={{ color: 'var(--text-3)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

        {/* Recently done (today only) */}
        {activeTodos.filter((t) => t.done).length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium mb-2 px-1" style={{ color: 'var(--text-3)' }}>
              Done today
            </p>
            {activeTodos
              .filter((t) => t.done)
              .slice(0, 3)
              .map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-4 rounded-2xl mb-2 group"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.5 }}
                >
                  <button
                    onClick={() => store.toggleTodo(activeCategory, todo.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: activeColor + '33', border: `2px solid ${activeColor}` }}
                  >
                    <Check size={14} style={{ color: activeColor }} />
                  </button>
                  <span className="flex-1 text-[15px] line-through" style={{ color: 'var(--text-3)' }}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => store.deleteTodo(activeCategory, todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    style={{ color: 'var(--text-3)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* View completed tasks button */}
      <button
        onClick={() => setShowArchive(true)}
        className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-2)',
        }}
      >
        <Archive size={16} />
        View completed tasks
        {totalCompleted > 0 && (
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md ml-1"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
          >
            {totalCompleted}
          </span>
        )}
      </button>
    </div>
  )
}
