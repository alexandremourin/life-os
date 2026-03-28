import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, Target, ListTodo, BookOpen } from 'lucide-react'
import { useStore } from './hooks/useStore'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import Todo from './pages/Todo'
import Journal from './pages/Journal'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: Target, label: 'Habits' },
  { to: '/todo', icon: ListTodo, label: 'To-do' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
]

export default function App() {
  const store = useStore()

  if (store.loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '2px solid var(--surface-3)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Main content */}
      <main style={{ flex: 1, padding: '24px 20px 88px', maxWidth: 900, width: '100%', margin: '0 auto' }}
            className="md-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard store={store} />} />
          <Route path="/habits" element={<Habits store={store} />} />
          <Route path="/todo" element={<Todo store={store} />} />
          <Route path="/journal" element={<Journal store={store} />} />
        </Routes>
      </main>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        height: 64,
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--surface-2)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item flex flex-col items-center gap-1 py-2 px-5 transition-all duration-200 ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-3)' }} />
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.05em', color: isActive ? 'var(--accent)' : 'var(--text-3)' }}>
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
