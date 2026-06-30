import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { budgetService } from '@/services/budgets'
import { formatCurrency, CATEGORIES, getCategoryById } from '@/utils/formatters'

export function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ category: 'food', limit: '' })

  useEffect(() => {
    budgetService.list()
      .then(r => setBudgets(r?.data ?? []))
      .catch(() => setBudgets([]))
      .finally(() => setLoading(false))
  }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSave(e) {
    e.preventDefault()
    const res = await budgetService.createOrUpdate({ ...form, limit: Number(form.limit) }).catch(() => null)
    const newBudget = res?.data ?? { ...form, limit: Number(form.limit), spent: 0, id: Date.now().toString() }
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.category === form.category)
      return idx >= 0
        ? prev.map((b, i) => i === idx ? { ...b, limit: Number(form.limit) } : b)
        : [...prev, newBudget]
    })
    setModalOpen(false)
    setForm({ category: 'food', limit: '' })
  }

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ngân sách</h2>
          <p className="text-sm text-gray-500 mt-0.5">Tháng {new Date().toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}</p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>Thêm ngân sách</Button>
      </div>

      {/* Overall progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Tổng chi tiêu</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            <p className="text-sm text-gray-400">/ {formatCurrency(totalBudget)} ngân sách</p>
          </div>
          <div className="w-20 h-20 relative flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={totalBudget > 0 && totalSpent / totalBudget > 0.9 ? '#ef4444' : '#6366f1'}
                strokeWidth="3"
                strokeDasharray={`${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold text-gray-900">
              {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
            </span>
          </div>
        </div>
      </Card>

      {/* Budget cards */}
      {loading ? (
        <p className="text-center text-gray-400 text-sm py-8">Đang tải...</p>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Chưa có ngân sách nào</p>
          <Button icon={Plus} size="sm" className="mt-3" onClick={() => setModalOpen(true)}>
            Thiết lập ngân sách đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => {
            const cat = getCategoryById(b.category)
            const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0
            const over = b.spent > b.limit
            return (
              <Card key={b.id ?? b.category}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: cat.color + '20' }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</p>
                  </div>
                  {over && (
                    <span className="text-xs font-medium text-danger-500 bg-danger-50 px-2 py-0.5 rounded-full">
                      Vượt {formatCurrency(b.spent - b.limit)}
                    </span>
                  )}
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : cat.color,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 text-right">{Math.round(pct)}% đã dùng</p>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thiết lập ngân sách">
        <form onSubmit={handleSave} className="space-y-4">
          <Select label="Danh mục" value={form.category} onChange={set('category')}>
            {CATEGORIES.filter(c => c.id !== 'income').map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </Select>
          <Input label="Hạn mức (VND)" type="number" placeholder="0" min="0"
            value={form.limit} onChange={set('limit')} required />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Huỷ</Button>
            <Button type="submit" className="flex-1">Lưu</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
