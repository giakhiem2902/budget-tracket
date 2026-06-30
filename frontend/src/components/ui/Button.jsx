import { classNames } from '@/utils/formatters'

const variants = {
  primary:   'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm shadow-primary-500/20',
  secondary: 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 focus:ring-gray-300',
  danger:    'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 shadow-sm shadow-danger-500/20',
  ghost:     'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 focus:ring-gray-300',
  success:   'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-sm shadow-success-500/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl',
        'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
        'active:scale-95 dark:focus:ring-offset-slate-800',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  )
}
