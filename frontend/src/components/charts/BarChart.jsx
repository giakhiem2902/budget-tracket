import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts'
import { useIsDark } from '@/hooks/useIsDark'

function fmt(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return v
}

export function MonthlyBarChart({ data }) {
  const dark = useIsDark()
  const grid = dark ? '#334155' : '#f0f0f0'
  const tick = dark ? '#94a3b8' : '#9ca3af'
  const cursor = dark ? '#1e293b' : '#f9fafb'
  const tooltip = dark
    ? { borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', background: '#1e293b', color: '#f1f5f9' }
    : { borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: tick }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => new Intl.NumberFormat('vi-VN').format(v) + ' ₫'}
          contentStyle={tooltip}
          labelStyle={dark ? { color: '#94a3b8' } : {}}
          cursor={{ fill: cursor }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: tick }} />
        <Bar dataKey="income"  name="Thu nhập" fill="#10b981" radius={[6, 6, 0, 0]}
          animationDuration={800} animationEasing="ease-out" />
        <Bar dataKey="expense" name="Chi tiêu"  fill="#6366f1" radius={[6, 6, 0, 0]}
          animationDuration={800} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  )
}
