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
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <span className="text-sm" style={{ color: 'var(--text-3)' }}>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Main content */}
      <main className="flex-1 pb-20 px-4 pt-5 md:px-6 md:pt-8 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard store={store} />} />
          <Route path="/habits" element={<Habits store={store} />} />
          <Route path="/todo" element={<Todo store={store} />} />
          <Route path="/journal" element={<Journal store={store} />} />
        </Routes>
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 md:h-18 px-4 safe-bottom"
        style={{
          background: 'linear-gradient(to top, var(--bg) 70%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item flex flex-col items-center gap-1 py-2 px-4 transition-all duration-200 ${
                isActive ? 'active' : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-3)' }}
                />
                <span
                  className="text-[11px] font-medium tracking-wide"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-3)' }}
                >
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
