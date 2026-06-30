import { classNames } from '@/utils/formatters'

export function Card({ children, className = '', hover = false, animate = false, delay = 0, ...props }) {
  return (
    <div
      className={classNames(
        'bg-white dark:bg-slate-800 rounded-2xl shadow-card dark:shadow-card-dark p-6 transition-all duration-200',
        hover && 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        animate && 'animate-fade-up',
        className
      )}
      style={animate && delay ? { animationDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  const colors = {
    primary: { bg: 'bg-primary-50 dark:bg-primary-500/10',  icon: 'text-primary-500 dark:text-primary-400' },
    success: { bg: 'bg-success-50 dark:bg-success-500/10',  icon: 'text-success-500' },
    danger:  { bg: 'bg-danger-50  dark:bg-danger-500/10',   icon: 'text-danger-500' },
    warning: { bg: 'bg-warning-50 dark:bg-warning-500/10',  icon: 'text-warning-500' },
  }
  const c = colors[color]

  return (
    <Card hover>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
            <Icon className={`w-6 h-6 ${c.icon}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-slate-100 mt-0.5 truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {trend != null && (
          <div className={`text-sm font-semibold flex-shrink-0 ${trend >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </Card>
  )
}
