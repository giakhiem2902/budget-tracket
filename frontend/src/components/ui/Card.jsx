import { classNames } from '@/utils/formatters'

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={classNames(
        'bg-white rounded-2xl shadow-card p-6',
        hover && 'transition-shadow hover:shadow-card-hover cursor-pointer',
        className
      )}
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
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  const colors = {
    primary: { bg: 'bg-primary-50', icon: 'text-primary-500' },
    success: { bg: 'bg-success-50', icon: 'text-success-500' },
    danger:  { bg: 'bg-danger-50',  icon: 'text-danger-500' },
    warning: { bg: 'bg-warning-50', icon: 'text-warning-500' },
  }
  const c = colors[color]

  return (
    <Card>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg}`}>
            <Icon className={`w-6 h-6 ${c.icon}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {trend != null && (
          <div className={`text-sm font-medium ${trend >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </Card>
  )
}
