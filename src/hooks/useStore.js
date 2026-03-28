import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import * as XLSX from 'xlsx'

const getToday = () => new Date().toISOString().split('T')[0]

const DEFAULT_HABITS = [
  { id: 'sleep', label: 'Sleep', target: '7h min' },
  { id: 'sport', label: 'Sport', target: '1h min' },
  { id: 'lunch', label: 'Lunch', target: 'healthy' },
  { id: 'dinner', label: 'Dinner', target: 'healthy' },
  { id: 'smoke', label: 'Smoke', target: '0 cigs' },
  { id: 'deepwork', label: 'Deepwork', target: 'done' },
  { id: 'supplements', label: 'Supplements', target: 'taken' },
  { id: 'ms', label: 'MS', target: 'done' },
  { id: 'hydration', label: 'Hydration', target: '3L' },
  { id: 'reading', label: 'Reading', target: '15 min' },
]

const TODO_CATEGORIES = [
  { id: 'tcs', label: 'TCS', color: '#6366f1' },
  { id: 'projects', label: 'Personal Projects', color: '#f59e0b' },
  { id: 'ace', label: 'ACE', color: '#10b981' },
  { id: 'personal', label: 'Personal', color: '#ec4899' },
]

const LEVELS = [
  { level: 1, name: 'Beginner', min: 0, max: 500 },
  { level: 2, name: 'Consistent', min: 500, max: 1500 },
  { level: 3, name: 'Dedicated', min: 1500, max: 3500 },
  { level: 4, name: 'Elite', min: 3500, max: 7000 },
  { level: 5, name: 'Master', min: 7000, max: null },
]

export function useStore() {
  const today = getToday()

  const [habitsData, setHabitsData] = useState({})
  const [todos, setTodos] = useState({ tcs: [], projects: [], ace: [], personal: [] })
  const [journal, setJournal] = useState({})
  const [smokeStreak, setSmokeStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  // ── LOCALSTORAGE STATE ──
  const [validatedDays, setValidatedDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem('life-os-validated') || '{}') } catch { return {} }
  })
  const [todoMeta, setTodoMeta] = useState(() => {
    try { return JSON.parse(localStorage.getItem('life-os-todo-meta') || '{}') } catch { return {} }
  })
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('life-os-notes') || '[]') } catch { return [] }
  })

  // ── LOAD DATA ──
  useEffect(() => {
    async function loadAll() {
      try {
        const { data: habitsRows } = await supabase.from('habits_log').select('*')
        if (habitsRows) {
          const grouped = {}
          habitsRows.forEach((r) => {
            if (!grouped[r.date]) grouped[r.date] = {}
            grouped[r.date][r.habit_id] = r.completed
          })
          setHabitsData(grouped)
        }

        const { data: todoRows } = await supabase.from('todos').select('*').order('created_timestamp', { ascending: true })
        if (todoRows) {
          const grouped = { tcs: [], projects: [], ace: [], personal: [] }
          todoRows.forEach((r) => {
            if (grouped[r.category]) {
              grouped[r.category].push({ id: r.id, text: r.text, done: r.done, createdAt: r.created_at, completedAt: r.completed_at })
            }
          })
          setTodos(grouped)
        }

        const { data: journalRows } = await supabase.from('journal').select('*')
        if (journalRows) {
          const map = {}
          journalRows.forEach((r) => { map[r.date] = { score: r.score, positive: r.positive, negative: r.negative } })
          setJournal(map)
        }

        const { data: streakRows } = await supabase.from('smoke_streak').select('streak').eq('id', 1).single()
        if (streakRows) setSmokeStreak(streakRows.streak)
      } catch (err) { console.error('Failed to load:', err) }
      setLoading(false)
    }
    loadAll()
  }, [])

  // ── VALIDATION ──
  const validateDay = useCallback(() => {
    const updated = { ...validatedDays, [today]: true }
    setValidatedDays(updated)
    localStorage.setItem('life-os-validated', JSON.stringify(updated))
  }, [validatedDays, today])

  const isDayValidated = useCallback((date) => !!validatedDays[date || today], [validatedDays, today])

  // ── HABITS ──
  const toggleHabit = useCallback(async (habitId) => {
    const dayData = habitsData[today] || {}
    const newVal = !dayData[habitId]
    setHabitsData((prev) => ({ ...prev, [today]: { ...prev[today], [habitId]: newVal } }))
    await supabase.from('habits_log').upsert({ date: today, habit_id: habitId, completed: newVal }, { onConflict: 'date,habit_id' })
    if (habitId === 'smoke') {
      const newStreak = newVal ? smokeStreak + 1 : Math.max(0, smokeStreak - 1)
      setSmokeStreak(newStreak)
      await supabase.from('smoke_streak').update({ streak: newStreak }).eq('id', 1)
    }
  }, [habitsData, today, smokeStreak])

  const getTodayHabits = () => habitsData[today] || {}
  const getCompletionRate = () => {
    const done = Object.values(habitsData[today] || {}).filter(Boolean).length
    return Math.round((done / DEFAULT_HABITS.length) * 100)
  }

  const getHabitStreak = useCallback((habitId) => {
    let streak = 0
    const d = new Date()
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0]
      if (habitsData[key]?.[habitId]) { streak++; d.setDate(d.getDate() - 1) }
      else break
    }
    return streak
  }, [habitsData])

  const getHabitsHistory = useCallback((days = 30) => {
    const result = []
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const dayData = habitsData[key] || {}
      result.push({
        date: key, isToday: key === today,
        label: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
        habits: DEFAULT_HABITS.map(h => ({ ...h, done: !!dayData[h.id] })),
        completed: DEFAULT_HABITS.filter(h => dayData[h.id]).length,
        total: DEFAULT_HABITS.length,
        validated: !!validatedDays[key],
      })
    }
    return result
  }, [habitsData, today, validatedDays])

  // ── GAMIFICATION XP ──
  const getTotalXP = useCallback(() => {
    let xp = 0
    Object.entries(habitsData).forEach(([, dayData]) => {
      const done = Object.values(dayData).filter(Boolean).length
      xp += done * 10
      if (done === DEFAULT_HABITS.length) xp += 50
    })
    return xp
  }, [habitsData])

  const getLevelInfo = useCallback(() => {
    const xp = getTotalXP()
    const lvl = LEVELS.find(l => l.max === null || xp < l.max) || LEVELS[LEVELS.length - 1]
    const pct = lvl.max ? Math.round(((xp - lvl.min) / (lvl.max - lvl.min)) * 100) : 100
    return { ...lvl, xp, pct }
  }, [getTotalXP])

  // ── TODOS ──
  const addTodo = useCallback(async (category, text) => {
    const tempId = Date.now().toString()
    setTodos((prev) => ({ ...prev, [category]: [...prev[category], { id: tempId, text, done: false, createdAt: today, completedAt: null }] }))
    const { data } = await supabase.from('todos').insert({ category, text, done: false, created_at: today }).select().single()
    if (data) {
      setTodos((prev) => ({ ...prev, [category]: prev[category].map((t) => t.id === tempId ? { ...t, id: data.id } : t) }))
    }
  }, [today])

  const toggleTodo = useCallback(async (category, todoId) => {
    const todo = (todos[category] || []).find(t => t.id === todoId)
    if (!todo) return
    const newDone = !todo.done
    setTodos((prev) => ({ ...prev, [category]: prev[category].map(t => t.id === todoId ? { ...t, done: newDone, completedAt: newDone ? today : null } : t) }))
    await supabase.from('todos').update({ done: newDone, completed_at: newDone ? today : null }).eq('id', todoId)
  }, [todos, today])

  const deleteTodo = useCallback(async (category, todoId) => {
    setTodos((prev) => ({ ...prev, [category]: prev[category].filter(t => t.id !== todoId) }))
    // Clean up meta
    const newMeta = { ...todoMeta }
    delete newMeta[todoId]
    setTodoMeta(newMeta)
    localStorage.setItem('life-os-todo-meta', JSON.stringify(newMeta))
    await supabase.from('todos').delete().eq('id', todoId)
  }, [todoMeta])

  const setTodoPriority = useCallback((todoId, priority) => {
    const updated = { ...todoMeta, [todoId]: { ...todoMeta[todoId], priority } }
    setTodoMeta(updated)
    localStorage.setItem('life-os-todo-meta', JSON.stringify(updated))
  }, [todoMeta])

  const setTodoDeadline = useCallback((todoId, deadline) => {
    const updated = { ...todoMeta, [todoId]: { ...todoMeta[todoId], deadline } }
    setTodoMeta(updated)
    localStorage.setItem('life-os-todo-meta', JSON.stringify(updated))
  }, [todoMeta])

  const getTodoMeta = useCallback((todoId) => todoMeta[todoId] || {}, [todoMeta])

  // ── NOTES ──
  const addNote = useCallback((text) => {
    const newNote = { id: Date.now().toString(), text, createdAt: today, pinned: false }
    const updated = [newNote, ...notes]
    setNotes(updated)
    localStorage.setItem('life-os-notes', JSON.stringify(updated))
  }, [notes, today])

  const deleteNote = useCallback((id) => {
    const updated = notes.filter(n => n.id !== id)
    setNotes(updated)
    localStorage.setItem('life-os-notes', JSON.stringify(updated))
  }, [notes])

  const updateNote = useCallback((id, text) => {
    const updated = notes.map(n => n.id === id ? { ...n, text } : n)
    setNotes(updated)
    localStorage.setItem('life-os-notes', JSON.stringify(updated))
  }, [notes])

  // ── JOURNAL ──
  const saveJournal = useCallback(async (score, positive, negative) => {
    setJournal((prev) => ({ ...prev, [today]: { score, positive, negative } }))
    await supabase.from('journal').upsert({ date: today, score, positive, negative }, { onConflict: 'date' })
  }, [today])

  const getTodayJournal = () => journal[today] || { score: 3, positive: '', negative: '' }

  const getJournalHistory = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const habitsForDay = habitsData[key] || {}
      days.push({
        date: key,
        shortDate: d.toLocaleDateString('en', { weekday: 'short' }),
        journal: journal[key] || null,
        habitsCompleted: Object.values(habitsForDay).filter(Boolean).length,
        habitsTotal: DEFAULT_HABITS.length,
      })
    }
    return days
  }

  const getFullHistory = useCallback((days = 30) => {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const habitsForDay = habitsData[key] || {}
      const habitsCompleted = Object.values(habitsForDay).filter(Boolean).length
      result.push({
        date: key,
        label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        shortLabel: d.toLocaleDateString('en', { weekday: 'short' }),
        isToday: key === today,
        journal: journal[key] || null,
        score: journal[key]?.score ?? null,
        habitsCompleted,
        habitsPct: Math.round((habitsCompleted / DEFAULT_HABITS.length) * 100),
        habitsTotal: DEFAULT_HABITS.length,
      })
    }
    return result
  }, [habitsData, journal, today])

  const getAllJournalEntries = useCallback(() => {
    return Object.entries(journal)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, entry]) => ({
        date,
        label: new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' }),
        shortLabel: new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
        ...entry,
      }))
  }, [journal])

  // ── WEEKLY REVIEW ──
  const getWeeklyReview = useCallback(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const dayData = habitsData[key] || {}
      days.push({ key, dayData, journal: journal[key] || null })
    }

    const scores = days.filter(d => d.journal).map(d => d.journal.score)
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null

    const habitCounts = {}
    DEFAULT_HABITS.forEach(h => { habitCounts[h.id] = 0 })
    days.forEach(d => DEFAULT_HABITS.forEach(h => { if (d.dayData[h.id]) habitCounts[h.id]++ }))

    const bestHabit = DEFAULT_HABITS.reduce((a, h) => habitCounts[h.id] > habitCounts[a.id] ? h : a, DEFAULT_HABITS[0])
    const worstHabit = DEFAULT_HABITS.reduce((a, h) => habitCounts[h.id] < habitCounts[a.id] ? h : a, DEFAULT_HABITS[0])

    const totalHabitsDone = days.reduce((acc, d) => acc + Object.values(d.dayData).filter(Boolean).length, 0)
    const habitsPct = Math.round((totalHabitsDone / (7 * DEFAULT_HABITS.length)) * 100)

    const completedTodos = Object.values(todos)
      .flat()
      .filter(t => t.done && t.completedAt && days.map(d => d.key).includes(t.completedAt))
      .length

    return { avgScore, habitsPct, bestHabit, worstHabit, completedTodos, daysLogged: scores.length }
  }, [habitsData, journal, todos])

  // ── ANALYTICS ──
  const getHeatmapData = useCallback((days = 91) => {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const dayData = habitsData[key] || {}
      const completed = Object.values(dayData).filter(Boolean).length
      result.push({
        date: key,
        dayOfWeek: d.getDay(),
        label: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
        completed,
        pct: Math.round((completed / DEFAULT_HABITS.length) * 100),
      })
    }
    return result
  }, [habitsData])

  const getAnalyticsStats = useCallback(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const byDay = Array(7).fill(0).map(() => ({ total: 0, days: 0 }))

    Object.entries(habitsData).forEach(([date, dayData]) => {
      const d = new Date(date + 'T12:00:00')
      const dow = d.getDay()
      byDay[dow].total += Object.values(dayData).filter(Boolean).length
      byDay[dow].days++
    })

    const bestDay = byDay.reduce((a, b, i) => (b.days && b.total / b.days > (a.days ? byDay[a.i].total / byDay[a.i].days : 0)) ? { i } : a, { i: 0 })
    const worstDay = byDay.reduce((a, b, i) => (b.days && b.total / b.days < (a.days ? byDay[a.i].total / byDay[a.i].days : 999)) ? { i } : a, { i: 0 })

    const habitCompletionRate = DEFAULT_HABITS.map(h => {
      const total = Object.values(habitsData).length
      const done = Object.values(habitsData).filter(d => d[h.id]).length
      return { ...h, rate: total ? Math.round((done / total) * 100) : 0 }
    }).sort((a, b) => a.rate - b.rate)

    const monthlyScores = {}
    Object.entries(journal).forEach(([date, entry]) => {
      const month = date.slice(0, 7)
      if (!monthlyScores[month]) monthlyScores[month] = { total: 0, count: 0 }
      monthlyScores[month].total += entry.score
      monthlyScores[month].count++
    })
    const byMonth = Object.entries(monthlyScores)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .map(([month, v]) => ({ month, avg: (v.total / v.count).toFixed(1) }))

    return {
      bestDay: dayNames[bestDay.i],
      worstDay: dayNames[worstDay.i],
      worstHabit: habitCompletionRate[0],
      bestHabit: habitCompletionRate[habitCompletionRate.length - 1],
      habitRanking: habitCompletionRate,
      byMonth,
    }
  }, [habitsData, journal])

  const getPendingTodos = () => Object.values(todos).reduce((acc, cat) => acc + cat.filter(t => !t.done).length, 0)

  // ── EXPORT ──
  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new()
    const habitsRows = Object.keys(habitsData).sort().map((date) => {
      const row = { Date: date }
      DEFAULT_HABITS.forEach(h => { row[h.label] = habitsData[date]?.[h.id] ? 'Yes' : 'No' })
      return row
    })
    if (habitsRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(habitsRows), 'Habits')
    const todoRows = []
    Object.entries(todos).forEach(([catId, tasks]) => {
      const catLabel = TODO_CATEGORIES.find(c => c.id === catId)?.label || catId
      tasks.forEach(t => {
        const meta = todoMeta[t.id] || {}
        todoRows.push({ Category: catLabel, Task: t.text, Status: t.done ? 'Done' : 'Pending', Priority: meta.priority || 'normal', Deadline: meta.deadline || '', 'Completed at': t.completedAt || '' })
      })
    })
    if (todoRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(todoRows), 'Todos')
    const journalRows = Object.entries(journal).sort(([a], [b]) => a.localeCompare(b))
      .map(([date, e]) => ({ Date: date, Score: e.score, Positive: e.positive || '', Negative: e.negative || '' }))
    if (journalRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(journalRows), 'Journal')
    XLSX.writeFile(wb, `life-os-export-${today}.xlsx`)
  }, [habitsData, todos, journal, todoMeta, today])

  return {
    today, loading,
    habits: DEFAULT_HABITS, categories: TODO_CATEGORIES,
    habitsData, todos, journal, smokeStreak, notes,
    toggleHabit, getTodayHabits, getCompletionRate,
    validateDay, isDayValidated,
    getHabitStreak, getHabitsHistory,
    getTotalXP, getLevelInfo,
    addTodo, toggleTodo, deleteTodo,
    setTodoPriority, setTodoDeadline, getTodoMeta,
    addNote, deleteNote, updateNote,
    saveJournal, getTodayJournal, getJournalHistory,
    getFullHistory, getAllJournalEntries,
    getWeeklyReview,
    getHeatmapData, getAnalyticsStats,
    getPendingTodos, exportToExcel,
  }
}
