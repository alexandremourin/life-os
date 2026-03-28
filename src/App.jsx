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
    <div className="min-h-[100dvh] flex" style={{ background: 'var(--bg)' }}>

      {/* Sidebar — desktop only */}
      <aside
        className="hidden md:flex flex-col gap-1 py-8 px-3 w-56 shrink-0 sticky top-0 h-screen"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {/* Logo */}
        <div className="px-3 mb-8">
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
            LIFE OS
          </span>
        </div>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'sidebar-active' : ''
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-3)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.5} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-8 px-4 pt-5 md:px-8 md:pt-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard store={store} />} />
            <Route path="/habits" element={<Habits store={store} />} />
            <Route path="/todo" element={<Todo store={store} />} />
            <Route path="/journal" element={<Journal store={store} />} />
          </Routes>
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 px-4 safe-bottom"
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
