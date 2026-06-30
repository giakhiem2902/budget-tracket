import { useState, useEffect, useCallback } from 'react'
import { Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { CATEGORIES } from '@/utils/formatters'
import { aiService } from '@/services/ai'

const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c.id !== 'income')

export function TransactionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    type: initial?.type ?? 'expense',
    description: initial?.description ?? '',
    amount: initial?.amount ?? '',
    category: initial?.category ?? 'food',
    date: initial?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    note: initial?.note ?? '',
  })
  const [receiptFile, setReceiptFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [suggesting, setSuggesting] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const suggestCategory = useCallback(async () => {
    if (!form.description) return
    setSuggesting(true)
    try {
      const res = await aiService.categorize(form.description, form.amount)
      if (res?.data?.category) setForm(f => ({ ...f, category: res.data.category }))
    } catch { /* silent */ }
    finally { setSuggesting(false) }
  }, [form.description, form.amount])

  useEffect(() => {
    if (form.type !== 'expense' || form.description.length < 3) return
    const timer = setTimeout(suggestCategory, 900)
    return () => clearTimeout(timer)
  }, [form.description, form.type, suggestCategory])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave({ ...form, amount: Number(form.amount), receiptFile })
    setSaving(false)
  }

  const cats = form.type === 'income' ? CATEGORIES.filter(c => c.id === 'income') : EXPENSE_CATEGORIES

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {[{ v: 'expense', label: 'Chi tiêu' }, { v: 'income', label: 'Thu nhập' }].map(({ v, label }) => (
          <button key={v} type="button"
            onClick={() => setForm(f => ({ ...f, type: v, category: v === 'income' ? 'income' : 'food' }))}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              form.type === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <Input label="Số tiền (VND)" type="number" placeholder="0" min="0"
        value={form.amount} onChange={set('amount')} required />

      <div className="relative">
        <Input label="Mô tả" placeholder="Ăn trưa, Mua sắm..."
          value={form.description} onChange={set('description')} required />
        {form.type === 'expense' && form.description && (
          <button type="button" onClick={suggestCategory}
            className="absolute right-2 bottom-2 text-xs text-primary-500 hover:underline">
            {suggesting ? 'Đang phân tích...' : '✨ AI gợi ý'}
          </button>
        )}
      </div>

      <Select label="Danh mục" value={form.category} onChange={set('category')}>
        {cats.map(c => (
          <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
        ))}
      </Select>

      <Input label="Ngày" type="date" value={form.date} onChange={set('date')} required />

      <Input label="Ghi chú (tuỳ chọn)" placeholder="Ghi chú thêm..."
        value={form.note} onChange={set('note')} />

      {/* Receipt upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Paperclip className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
          Ảnh hóa đơn (tuỳ chọn)
        </label>
        {initial?.receiptUrl && !receiptFile && (
          <a href={initial.receiptUrl} target="_blank" rel="noreferrer"
            className="text-xs text-primary-500 hover:underline block mb-1.5">
            Xem hóa đơn hiện tại →
          </a>
        )}
        <input type="file" accept="image/*,application/pdf"
          onChange={e => setReceiptFile(e.target.files[0] ?? null)}
          className="block w-full text-sm text-gray-500
            file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
            file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600
            hover:file:bg-primary-100 cursor-pointer" />
        {receiptFile && (
          <p className="text-xs text-gray-400 mt-1">{receiptFile.name}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Huỷ</Button>
        <Button type="submit" className="flex-1" loading={saving}>Lưu</Button>
      </div>
    </form>
  )
}
