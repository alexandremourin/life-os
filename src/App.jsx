import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, Target, ListTodo, BookOpen, BarChart2, StickyNote } from 'lucide-react'
import { useStore } from './hooks/useStore'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import Todo from './pages/Todo'
import Journal from './pages/Journal'
import Analytics from './pages/Analytics'
import Notes from './pages/Notes'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/habits', icon: Target, label: 'Habits' },
  { to: '/todo', icon: ListTodo, label: 'Todo' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/analytics', icon: BarChart2, label: 'Stats' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
]

export default function App() {
  const store = useStore()

  if (store.loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--surface-3)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Safe area top spacer for iOS */}
      <div className="safe-top" style={{ background: 'var(--bg)', flexShrink: 0 }} />

      {/* Main content */}
      <main
        className="md-main"
        style={{ flex: 1, padding: '20px 16px 104px', maxWidth: 900, width: '100%', margin: '0 auto', overflowY: 'auto' }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard store={store} />} />
          <Route path="/habits" element={<Habits store={store} />} />
          <Route path="/todo" element={<Todo store={store} />} />
          <Route path="/journal" element={<Journal store={store} />} />
          <Route path="/analytics" element={<Analytics store={store} />} />
          <Route path="/notes" element={<Notes store={store} />} />
        </Routes>
      </main>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
        zIndex: 100,
      }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item flex flex-col items-center gap-0.5 py-1.5 px-2 transition-all duration-200 ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.5}
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-3)' }} />
                <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.04em', color: isActive ? 'var(--accent)' : 'var(--text-3)' }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
