import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { useIsDark } from '@/hooks/useIsDark'

export function CategoryPieChart({ data }) {
  const dark = useIsDark()
  const tooltip = dark
    ? { borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', background: '#1e293b', color: '#f1f5f9' }
    : { borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
  const tick = dark ? '#94a3b8' : '#6b7280'

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="45%"
          innerRadius={55} outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => new Intl.NumberFormat('vi-VN').format(v) + ' ₫'}
          contentStyle={tooltip}
          labelStyle={dark ? { color: '#94a3b8' } : {}}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: tick }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
