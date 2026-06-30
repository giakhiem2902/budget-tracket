import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, Pencil, Paperclip } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { TransactionForm } from './TransactionForm'
import { transactionService } from '@/services/transactions'
import { formatCurrency, formatDate, getCategoryById } from '@/utils/formatters'

export function Transactions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await transactionService.list({ search, type: filter === 'all' ? undefined : filter })
      setItems(res?.data?.items ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [search, filter])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(txn) { setEditing(txn); setModalOpen(true) }

  async function handleDelete(id) {
    if (!window.confirm('Xóa giao dịch này?')) return
    await transactionService.remove(id).catch(() => null)
    setItems(prev => prev.filter(t => t.id !== id))
  }

  async function handleSave(data) {
    const { receiptFile, ...txnData } = data

    if (editing) {
      await transactionService.update(editing.id, txnData).catch(() => null)
      let receiptUrl = editing.receiptUrl
      if (receiptFile) {
        receiptUrl = await transactionService.uploadReceipt(editing.id, receiptFile).catch(() => null)
      }
      setItems(prev => prev.map(t => t.id === editing.id ? { ...t, ...txnData, receiptUrl } : t))
    } else {
      const res = await transactionService.create(txnData).catch(() => null)
      const newItem = res?.data ?? { ...txnData, id: Date.now().toString(), date: new Date().toISOString() }
      if (receiptFile && newItem.id) {
        const receiptUrl = await transactionService.uploadReceipt(newItem.id, receiptFile).catch(() => null)
        if (receiptUrl) newItem.receiptUrl = receiptUrl
      }
      setItems(prev => [newItem, ...prev])
    }
    setModalOpen(false)
  }

  const filtered = items.filter(t =>
    t.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Giao dịch</h2>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} giao dịch</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Thêm mới</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Tìm kiếm giao dịch..."
          icon={Search}
          className="flex-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {['all', 'income', 'expense'].map(t => (
            <Button key={t} size="sm"
              variant={filter === t ? 'primary' : 'secondary'}
              onClick={() => setFilter(t)}>
              {t === 'all' ? 'Tất cả' : t === 'income' ? 'Thu' : 'Chi'}
            </Button>
          ))}
        </div>
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">
              {search || filter !== 'all' ? 'Không tìm thấy giao dịch phù hợp' : 'Chưa có giao dịch nào'}
            </p>
            {!search && filter === 'all' && (
              <Button icon={Plus} className="mt-4" onClick={openCreate}>Thêm giao dịch đầu tiên</Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(txn => {
              const cat = getCategoryById(txn.category)
              return (
                <div key={txn.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: cat.color + '20' }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{txn.description}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(txn.date)} · {cat.label}
                      {txn.receiptUrl && (
                        <a href={txn.receiptUrl} target="_blank" rel="noreferrer"
                          className="ml-2 text-primary-400 hover:text-primary-600 inline-flex items-center gap-0.5">
                          <Paperclip className="w-3 h-3" /> Hóa đơn
                        </a>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${txn.type === 'income' ? 'text-success-500' : 'text-gray-900'}`}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(txn)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(txn.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-danger-500 hover:bg-danger-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}>
        <TransactionForm initial={editing} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
