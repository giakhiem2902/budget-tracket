import { Bell, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

export function Navbar({ title }) {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-6 transition-colors duration-200 z-20 relative">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-90"
          title={dark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-90">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 ring-2 ring-primary-200 dark:ring-primary-500/30">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  )
}
