import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { useIsDark } from '@/hooks/useIsDark'

function fmt(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return v
}

export function SpendingTrendChart({ data }) {
  const dark = useIsDark()
  const grid = dark ? '#334155' : '#f0f0f0'
  const tick = dark ? '#94a3b8' : '#9ca3af'
  const tooltip = dark
    ? { borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', background: '#1e293b', color: '#f1f5f9' }
    : { borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="lgIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lgExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => new Intl.NumberFormat('vi-VN').format(v) + ' ₫'}
          contentStyle={tooltip}
          labelStyle={dark ? { color: '#94a3b8' } : {}}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: tick }} />
        <Area type="monotone" dataKey="income"  name="Thu nhập" stroke="#10b981" strokeWidth={2.5} fill="url(#lgIncome)"
          dot={false} activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={800} animationEasing="ease-out" />
        <Area type="monotone" dataKey="expense" name="Chi tiêu"  stroke="#6366f1" strokeWidth={2.5} fill="url(#lgExpense)"
          dot={false} activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={800} animationEasing="ease-out" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
