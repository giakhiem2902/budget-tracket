import { useState, useEffect } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { SpendingTrendChart } from '@/components/charts/LineChart'
import { CategoryPieChart } from '@/components/charts/PieChart'
import { MonthlyBarChart } from '@/components/charts/BarChart'
import { reportService } from '@/services/reports'
import { formatCurrency } from '@/utils/formatters'

const EMPTY = {
  summary: { income: 0, expense: 0, savings: 0 },
  trends: [],
  categories: [],
}

export function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reportService.summary().catch(() => null),
      reportService.trends().catch(() => null),
      reportService.categories().catch(() => null),
    ]).then(([s, t, c]) => {
      setData({
        summary:    s?.data    ?? EMPTY.summary,
        trends:     t?.data    ?? EMPTY.trends,
        categories: c?.data    ?? EMPTY.categories,
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center text-gray-400 py-8">Đang tải...</p>

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Báo cáo</h2>
        <p className="text-sm text-gray-500 mt-0.5">Tổng quan tài chính của bạn</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng thu',   value: data.summary.income,  color: 'text-success-500' },
          { label: 'Tổng chi',   value: data.summary.expense, color: 'text-danger-500'  },
          { label: 'Tiết kiệm', value: data.summary.savings,      color: 'text-primary-500' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{formatCurrency(value)}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Xu hướng thu chi" subtitle="6 tháng gần nhất" />
          {data.trends.length > 0
            ? <SpendingTrendChart data={data.trends} />
            : <p className="text-center text-gray-400 text-sm py-8">Chưa có dữ liệu</p>
          }
        </Card>
        <Card>
          <CardHeader title="Chi tiêu theo danh mục" />
          {data.categories.length > 0
            ? <CategoryPieChart data={data.categories} />
            : <p className="text-center text-gray-400 text-sm py-8">Chưa có dữ liệu</p>
          }
        </Card>
      </div>

      <Card>
        <CardHeader title="Chi tiêu hàng tháng" />
        {data.trends.length > 0
          ? <MonthlyBarChart data={data.trends} />
          : <p className="text-center text-gray-400 text-sm py-8">Chưa có dữ liệu</p>
        }
      </Card>
    </div>
  )
}
