import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import * as XLSX from 'xlsx'

const getToday = () => new Date().toISOString().split('T')[0]

const DEFAULT_HABITS = [
  { id: 'sleep', label: 'Sleep', target: '7h min', icon: '🌙' },
  { id: 'sport', label: 'Sport', target: '1h min', icon: '💪' },
  { id: 'lunch', label: 'Lunch', target: 'healthy', icon: '🥗' },
  { id: 'dinner', label: 'Dinner', target: 'healthy', icon: '🍽' },
  { id: 'smoke', label: 'Smoke', target: '0 cigs', icon: '🚭' },
  { id: 'deepwork', label: 'Deepwork', target: 'done', icon: '🎯' },
  { id: 'supplements', label: 'Supplements', target: 'taken', icon: '💊' },
  { id: 'ms', label: 'MS', target: 'done', icon: '🧘' },
  { id: 'hydration', label: 'Hydration', target: '3L', icon: '💧' },
  { id: 'reading', label: 'Reading', target: '15 min', icon: '📖' },
]

const TODO_CATEGORIES = [
  { id: 'tcs', label: 'TCS', color: '#6366f1' },
  { id: 'projects', label: 'Personal Projects', color: '#f59e0b' },
  { id: 'ace', label: 'ACE', color: '#10b981' },
  { id: 'personal', label: 'Personal', color: '#ec4899' },
]

export function useStore() {
  const today = getToday()

  const [habitsData, setHabitsData] = useState({})
  const [todos, setTodos] = useState({ tcs: [], projects: [], ace: [], personal: [] })
  const [journal, setJournal] = useState({})
  const [smokeStreak, setSmokeStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  // ── LOAD ALL DATA ON MOUNT ──
  useEffect(() => {
    async function loadAll() {
      try {
        // Load habits
        const { data: habitsRows } = await supabase
          .from('habits_log')
          .select('*')
        if (habitsRows) {
          const grouped = {}
          habitsRows.forEach((r) => {
            if (!grouped[r.date]) grouped[r.date] = {}
            grouped[r.date][r.habit_id] = r.completed
          })
          setHabitsData(grouped)
        }

        // Load todos
        const { data: todoRows } = await supabase
          .from('todos')
          .select('*')
          .order('created_timestamp', { ascending: true })
        if (todoRows) {
          const grouped = { tcs: [], projects: [], ace: [], personal: [] }
          todoRows.forEach((r) => {
            if (grouped[r.category]) {
              grouped[r.category].push({
                id: r.id,
                text: r.text,
                done: r.done,
                createdAt: r.created_at,
                completedAt: r.completed_at,
              })
            }
          })
          setTodos(grouped)
        }

        // Load journal
        const { data: journalRows } = await supabase
          .from('journal')
          .select('*')
        if (journalRows) {
          const map = {}
          journalRows.forEach((r) => {
            map[r.date] = { score: r.score, positive: r.positive, negative: r.negative }
          })
          setJournal(map)
        }

        // Load smoke streak
        const { data: streakRows } = await supabase
          .from('smoke_streak')
          .select('streak')
          .eq('id', 1)
          .single()
        if (streakRows) {
          setSmokeStreak(streakRows.streak)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      }
      setLoading(false)
    }
    loadAll()
  }, [])

  // ── HABITS ──
  const toggleHabit = useCallback(
    async (habitId) => {
      const dayData = habitsData[today] || {}
      const newVal = !dayData[habitId]

      // Optimistic update
      setHabitsData((prev) => ({
        ...prev,
        [today]: { ...prev[today], [habitId]: newVal },
      }))

      // Sync to Supabase
      await supabase.from('habits_log').upsert(
        { date: today, habit_id: habitId, completed: newVal },
        { onConflict: 'date,habit_id' }
      )

      // Smoke streak
      if (habitId === 'smoke') {
        const newStreak = newVal
          ? smokeStreak + 1
          : Math.max(0, smokeStreak - 1)
        setSmokeStreak(newStreak)
        await supabase
          .from('smoke_streak')
          .update({ streak: newStreak })
          .eq('id', 1)
      }
    },
    [habitsData, today, smokeStreak]
  )

  const getTodayHabits = () => habitsData[today] || {}

  const getCompletionRate = () => {
    const dayData = habitsData[today] || {}
    const done = Object.values(dayData).filter(Boolean).length
    return Math.round((done / DEFAULT_HABITS.length) * 100)
  }

  // ── TODOS ──
  const addTodo = useCallback(
    async (category, text) => {
      const tempId = Date.now().toString()

      // Optimistic
      setTodos((prev) => ({
        ...prev,
        [category]: [
          ...prev[category],
          { id: tempId, text, done: false, createdAt: today, completedAt: null },
        ],
      }))

      // Sync
      const { data } = await supabase
        .from('todos')
        .insert({ category, text, done: false, created_at: today })
        .select()
        .single()

      // Replace temp ID with real ID
      if (data) {
        setTodos((prev) => ({
          ...prev,
          [category]: prev[category].map((t) =>
            t.id === tempId
              ? { ...t, id: data.id, createdAt: data.created_at }
              : t
          ),
        }))
      }
    },
    [today]
  )

  const toggleTodo = useCallback(
    async (category, todoId) => {
      const todo = (todos[category] || []).find((t) => t.id === todoId)
      if (!todo) return

      const newDone = !todo.done
      const newCompletedAt = newDone ? today : null

      // Optimistic
      setTodos((prev) => ({
        ...prev,
        [category]: prev[category].map((t) =>
          t.id === todoId
            ? { ...t, done: newDone, completedAt: newCompletedAt }
            : t
        ),
      }))

      // Sync
      await supabase
        .from('todos')
        .update({ done: newDone, completed_at: newCompletedAt })
        .eq('id', todoId)
    },
    [todos, today]
  )

  const deleteTodo = useCallback(
    async (category, todoId) => {
      // Optimistic
      setTodos((prev) => ({
        ...prev,
        [category]: prev[category].filter((t) => t.id !== todoId),
      }))

      // Sync
      await supabase.from('todos').delete().eq('id', todoId)
    },
    []
  )

  // ── JOURNAL ──
  const saveJournal = useCallback(
    async (score, positive, negative) => {
      // Optimistic
      setJournal((prev) => ({
        ...prev,
        [today]: { score, positive, negative },
      }))

      // Sync
      await supabase.from('journal').upsert(
        { date: today, score, positive, negative },
        { onConflict: 'date' }
      )
    },
    [today]
  )

  const getTodayJournal = () =>
    journal[today] || { score: 5, positive: '', negative: '' }

  const getJournalHistory = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const habitsForDay = habitsData[key] || {}
      const doneCount = Object.values(habitsForDay).filter(Boolean).length
      days.push({
        date: key,
        shortDate: d.toLocaleDateString('en', { weekday: 'short' }),
        journal: journal[key] || null,
        habitsCompleted: doneCount,
        habitsTotal: DEFAULT_HABITS.length,
      })
    }
    return days
  }

  const getPendingTodos = () =>
    Object.values(todos).reduce(
      (acc, cat) => acc + cat.filter((t) => !t.done).length,
      0
    )

  // ── EXPORT TO EXCEL ──
  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new()

    // Sheet 1: Habits
    const habitsRows = []
    const sortedDates = Object.keys(habitsData).sort()
    sortedDates.forEach((date) => {
      const row = { Date: date }
      DEFAULT_HABITS.forEach((h) => {
        row[h.label] = habitsData[date]?.[h.id] ? 'Yes' : 'No'
      })
      habitsRows.push(row)
    })
    if (habitsRows.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(habitsRows)
      XLSX.utils.book_append_sheet(wb, ws1, 'Habits')
    }

    // Sheet 2: Todos
    const todoRows = []
    Object.entries(todos).forEach(([catId, tasks]) => {
      const catLabel = TODO_CATEGORIES.find((c) => c.id === catId)?.label || catId
      tasks.forEach((t) => {
        todoRows.push({
          Category: catLabel,
          Task: t.text,
          Status: t.done ? 'Done' : 'Pending',
          'Created at': t.createdAt || '',
          'Completed at': t.completedAt || '',
        })
      })
    })
    if (todoRows.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(todoRows)
      XLSX.utils.book_append_sheet(wb, ws2, 'Todos')
    }

    // Sheet 3: Journal
    const journalRows = Object.entries(journal)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entry]) => ({
        Date: date,
        Score: entry.score,
        Positive: entry.positive || '',
        Negative: entry.negative || '',
      }))
    if (journalRows.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(journalRows)
      XLSX.utils.book_append_sheet(wb, ws3, 'Journal')
    }

    XLSX.writeFile(wb, `life-os-export-${today}.xlsx`)
  }, [habitsData, todos, journal, today])

  return {
    today,
    loading,
    habits: DEFAULT_HABITS,
    categories: TODO_CATEGORIES,
    habitsData,
    todos,
    journal,
    smokeStreak,
    toggleHabit,
    getTodayHabits,
    getCompletionRate,
    addTodo,
    toggleTodo,
    deleteTodo,
    saveJournal,
    getTodayJournal,
    getJournalHistory,
    getPendingTodos,
    exportToExcel,
  }
}
