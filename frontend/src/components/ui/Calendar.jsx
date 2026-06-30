import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, getCategoryById } from '@/utils/formatters'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export function TransactionCalendar({ transactions = [] }) {
  const today = new Date()
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState(null)

  const { year, month } = cursor

  const txnMap = useMemo(() => {
    const map = {}
    transactions.forEach(txn => {
      const d = new Date(txn.date)
      if (d.getFullYear() !== year || d.getMonth() !== month) return
      const day = d.getDate()
      if (!map[day]) map[day] = []
      map[day].push(txn)
    })
    return map
  }, [transactions, year, month])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const selectedTxns = selected ? (txnMap[selected] ?? []) : []

  const monthLabel = new Date(year, month, 1).toLocaleString('vi-VN', { month: 'long', year: 'numeric' })

  const prev = () => setCursor(c => {
    if (c.month === 0) return { year: c.year - 1, month: 11 }
    return { year: c.year, month: c.month - 1 }
  })
  const next = () => setCursor(c => {
    if (c.month === 11) return { year: c.year + 1, month: 0 }
    return { year: c.year, month: c.month + 1 }
  })

  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 capitalize">{monthLabel}</span>
        <button
          onClick={next}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 dark:text-slate-500 py-1">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const hasTxns = !!txnMap[day]
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
          const isSelected = selected === day

          const hasIncome = hasTxns && txnMap[day].some(t => t.type === 'income')
          const hasExpense = hasTxns && txnMap[day].some(t => t.type === 'expense')

          return (
            <button
              key={day}
              onClick={() => setSelected(isSelected ? null : day)}
              className={[
                'relative flex flex-col items-center justify-start rounded-lg py-1.5 text-xs font-medium transition-all duration-150 active:scale-90',
                isSelected
                  ? 'bg-primary-500 text-white shadow-md'
                  : isToday
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-300 dark:ring-primary-500/30'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700',
              ].join(' ')}
            >
              <span>{day}</span>
              {hasTxns && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasIncome && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : 'bg-success-500'}`} />
                  )}
                  {hasExpense && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : 'bg-danger-500'}`} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day transactions */}
      {selected && (
        <div className="border-t border-gray-100 dark:border-slate-700 pt-3 animate-fade-up">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
            Ngày {selected}/{month + 1}
          </p>
          {selectedTxns.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-slate-500">Không có giao dịch</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {selectedTxns.map(txn => {
                const cat = getCategoryById(txn.category)
                return (
                  <div key={txn.id} className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">{txn.description}</p>
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${txn.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
