import { format, parseISO, isValid } from 'date-fns'
import { vi } from 'date-fns/locale'

export const CATEGORIES = [
  { id: 'food',          label: 'Ăn uống',       icon: '🍜', color: '#f59e0b' },
  { id: 'shopping',      label: 'Mua sắm',        icon: '🛍️', color: '#6366f1' },
  { id: 'bills',         label: 'Hóa đơn',        icon: '📄', color: '#ef4444' },
  { id: 'entertainment', label: 'Giải trí',        icon: '🎮', color: '#8b5cf6' },
  { id: 'transport',     label: 'Di chuyển',       icon: '🚗', color: '#10b981' },
  { id: 'health',        label: 'Sức khỏe',        icon: '💊', color: '#06b6d4' },
  { id: 'education',     label: 'Giáo dục',        icon: '📚', color: '#f97316' },
  { id: 'income',        label: 'Thu nhập',        icon: '💰', color: '#10b981' },
  { id: 'other',         label: 'Khác',            icon: '📦', color: '#6b7280' },
]

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}

export function formatCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr, pattern = 'dd/MM/yyyy') {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    if (!isValid(date)) return '—'
    return format(date, pattern, { locale: vi })
  } catch {
    return '—'
  }
}

export function formatMonthYear(dateStr) {
  return formatDate(dateStr, 'MMMM yyyy')
}

export function formatRelative(dateStr) {
  return formatDate(dateStr, 'dd MMM, HH:mm')
}

export function currentYearMonth() {
  return format(new Date(), 'yyyy-MM')
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
