import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus } from 'lucide-react'
import { StatCard, Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { SpendingTrendChart } from '@/components/charts/LineChart'
import { CategoryPieChart } from '@/components/charts/PieChart'
import { TransactionCalendar } from '@/components/ui/Calendar'
import { reportService } from '@/services/reports'
import { transactionService } from '@/services/transactions'
import { formatCurrency, formatRelative, getCategoryById } from '@/utils/formatters'
import { useNavigate } from 'react-router-dom'

const EMPTY_SUMMARY = {
  balance: 0, income: 0, expense: 0, savings: 0,
  incomeTrend: 0, expenseTrend: 0, trends: [], categories: [],
}

export function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [recentTxns, setRecentTxns] = useState([])
  const [allTxns, setAllTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      reportService.summary().catch(() => null),
      transactionService.list({ limit: 5 }).catch(() => null),
      transactionService.list({ limit: 100 }).catch(() => null),
    ]).then(([s, t, a]) => {
      setSummary(s?.data ?? EMPTY_SUMMARY)
      setRecentTxns(t?.data?.items ?? [])
      setAllTxns(a?.data?.items ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Tổng quan</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Tháng {new Date().toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/transactions')}>
          Thêm giao dịch
        </Button>
      </div>

      {/* Stat cards with stagger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="animate-fade-up stagger-1">
          <StatCard title="Số dư"     value={formatCurrency(summary.balance)}  icon={Wallet}      color="primary" />
        </div>
        <div className="animate-fade-up stagger-2">
          <StatCard title="Thu nhập"  value={formatCurrency(summary.income)}   icon={TrendingUp}  color="success" trend={summary.incomeTrend} />
        </div>
        <div className="animate-fade-up stagger-3">
          <StatCard title="Chi tiêu"  value={formatCurrency(summary.expense)}  icon={TrendingDown} color="danger"  trend={summary.expenseTrend} />
        </div>
        <div className="animate-fade-up stagger-4">
          <StatCard title="Tiết kiệm" value={formatCurrency(summary.savings)}  icon={PiggyBank}   color="warning" />
        </div>
      </div>

      {/* Charts + Calendar row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up stagger-2">
        <Card className="lg:col-span-2">
          <CardHeader title="Xu hướng chi tiêu" subtitle="6 tháng gần nhất" />
          <SpendingTrendChart data={summary.trends ?? []} />
        </Card>
        <Card>
          <CardHeader title="Lịch giao dịch" />
          <TransactionCalendar transactions={allTxns} />
        </Card>
      </div>

      {/* Category pie + recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up stagger-3">
        <Card>
          <CardHeader title="Theo danh mục" />
          <CategoryPieChart data={summary.categories ?? []} />
        </Card>

        {/* Recent transactions */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Giao dịch gần đây"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                Xem tất cả
              </Button>
            }
          />
          <div className="divide-y divide-gray-50 dark:divide-slate-700/60">
            {recentTxns.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 dark:text-slate-500 text-sm">Chưa có giao dịch nào</p>
                <Button icon={Plus} size="sm" className="mt-3" onClick={() => navigate('/transactions')}>
                  Thêm giao dịch đầu tiên
                </Button>
              </div>
            ) : recentTxns.map(txn => {
              const cat = getCategoryById(txn.category)
              return (
                <div key={txn.id} className="flex items-center gap-4 py-3 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110"
                    style={{ background: cat.color + '20' }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{txn.description}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{formatRelative(txn.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${txn.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <Badge variant={txn.type === 'income' ? 'success' : 'neutral'}>{cat.label}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
