import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SpendingTrendChart } from '@/components/charts/LineChart'
import { CategoryPieChart } from '@/components/charts/PieChart'
import { MonthlyBarChart } from '@/components/charts/BarChart'
import { reportService } from '@/services/reports'
import { aiService } from '@/services/ai'
import { formatCurrency } from '@/utils/formatters'

const EMPTY = {
  summary: { income: 0, expense: 0, savings: 0 },
  trends: [],
  categories: [],
}

function AiInsightsCard() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await aiService.insights()
      setInsights(res.data)
      setLoaded(true)
    } catch {
      setInsights({ summary: 'Không thể tải phân tích lúc này.', recommendations: [] })
      setLoaded(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-primary-100 dark:border-primary-900/40">
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500" />
            Phân tích AI
          </span>
        }
        subtitle="Lời khuyên tài chính từ Amazon Bedrock"
        action={
          loaded
            ? <button onClick={load} disabled={loading} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors active:scale-90">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            : null
        }
      />

      {!loaded ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 text-center max-w-xs">
            Phân tích thói quen chi tiêu và đưa ra lời khuyên cá nhân hoá bằng AI
          </p>
          <Button icon={Sparkles} onClick={load} loading={loading} size="sm">
            Tải phân tích AI
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-3 py-2">
          {[80, 60, 70].map((w, i) => (
            <div key={i} className={`h-4 bg-gray-100 dark:bg-slate-700 rounded animate-pulse`} style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up">
          {insights?.summary && (
            <div className="bg-primary-50 dark:bg-primary-500/10 rounded-xl p-4">
              <p className="text-sm text-primary-800 dark:text-primary-200 leading-relaxed">{insights.summary}</p>
            </div>
          )}
          {insights?.recommendations?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Gợi ý</p>
              {insights.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-3.5 h-3.5 text-success-500" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
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
        summary:    s?.data ?? EMPTY.summary,
        trends:     t?.data ?? EMPTY.trends,
        categories: c?.data ?? EMPTY.categories,
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Báo cáo</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Tổng quan tài chính của bạn</p>
      </div>

      {/* AI Insights */}
      <AiInsightsCard />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng thu',  value: data.summary.income,  color: 'text-success-500' },
          { label: 'Tổng chi',  value: data.summary.expense, color: 'text-danger-500'  },
          { label: 'Tiết kiệm', value: data.summary.savings, color: 'text-primary-500' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
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
            : <p className="text-center text-gray-400 dark:text-slate-500 text-sm py-8">Chưa có dữ liệu</p>
          }
        </Card>
        <Card>
          <CardHeader title="Chi tiêu theo danh mục" />
          {data.categories.length > 0
            ? <CategoryPieChart data={data.categories} />
            : <p className="text-center text-gray-400 dark:text-slate-500 text-sm py-8">Chưa có dữ liệu</p>
          }
        </Card>
      </div>

      <Card>
        <CardHeader title="Chi tiêu hàng tháng" />
        {data.trends.length > 0
          ? <MonthlyBarChart data={data.trends} />
          : <p className="text-center text-gray-400 dark:text-slate-500 text-sm py-8">Chưa có dữ liệu</p>
        }
      </Card>
    </div>
  )
}
