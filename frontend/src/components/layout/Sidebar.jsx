import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Target, BarChart2, Settings, Wallet, LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { classNames } from '@/utils/formatters'

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Giao dịch' },
  { to: '/budgets',      icon: Target,          label: 'Ngân sách' },
  { to: '/reports',      icon: BarChart2,       label: 'Báo cáo' },
  { to: '/settings',     icon: Settings,        label: 'Cài đặt' },
]

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 flex flex-col z-30 transition-colors duration-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-slate-100">
          Budget<span className="text-primary-500">Tracket</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'
              )
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-all duration-150"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
