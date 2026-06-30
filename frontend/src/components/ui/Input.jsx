import { classNames } from '@/utils/formatters'

export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className={classNames('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          className={classNames(
            'w-full rounded-lg border px-3 py-2 text-sm transition-all duration-150',
            'bg-white dark:bg-slate-700',
            'text-gray-900 dark:text-slate-100',
            'placeholder:text-gray-400 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'dark:focus:ring-primary-400',
            error
              ? 'border-danger-500'
              : 'border-gray-200 dark:border-slate-600',
            Icon ? 'pl-9' : ''
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={classNames('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>
      )}
      <select
        className={classNames(
          'w-full rounded-lg border px-3 py-2 text-sm transition-all duration-150',
          'bg-white dark:bg-slate-700',
          'text-gray-900 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'dark:focus:ring-primary-400',
          error ? 'border-danger-500' : 'border-gray-200 dark:border-slate-600'
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  )
}
