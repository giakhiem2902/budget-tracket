import { useState, useEffect, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'
import { profileService } from '@/services/profile'

function Alert({ type, text }) {
  if (!text) return null
  return (
    <p className={`text-sm mt-1 ${type === 'success' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
      {text}
    </p>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} readOnly={false} />
      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-600 rounded-full peer
        peer-checked:bg-primary-500
        peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800
        transition-colors
        after:content-[''] after:absolute after:top-0.5 after:left-0.5
        after:bg-white after:rounded-full after:h-5 after:w-5
        after:transition-all peer-checked:after:translate-x-5" />
    </label>
  )
}

export function Settings() {
  const { user, updateUser, logout } = useAuth()

  // Profile
  const [profileName, setProfileName] = useState(user?.name ?? '')
  const [profileMsg, setProfileMsg] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // Password
  const [pwd, setPwd] = useState({ old: '', new: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState(null)
  const [savingPwd, setSavingPwd] = useState(false)

  // Notifications
  const [notif, setNotif] = useState({ budgetAlert: true, monthlyReport: true, anomaly: true })
  const [savingNotif, setSavingNotif] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Load profile from API on mount
  useEffect(() => {
    profileService.get().then(res => {
      const p = res.data
      setProfileName(p.name || user?.name || '')
      setNotif({
        budgetAlert:    p.notifyBudgetAlert    ?? true,
        monthlyReport:  p.notifyMonthlyReport  ?? true,
        anomaly:        p.notifyAnomaly        ?? true,
      })
    }).catch(() => {})
  }, [])

  // Save profile name
  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      await authService.updateName(profileName)
      await profileService.update({ name: profileName })
      updateUser({ name: profileName })
      setProfileMsg({ type: 'success', text: 'Đã cập nhật tên thành công' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message })
    } finally {
      setSavingProfile(false)
    }
  }

  // Toggle notification preference (auto-save)
  const handleToggleNotif = useCallback(async (key) => {
    const next = { ...notif, [key]: !notif[key] }
    setNotif(next)
    setSavingNotif(true)
    setNotifSaved(false)
    try {
      await profileService.update({
        notifyBudgetAlert:   next.budgetAlert,
        notifyMonthlyReport: next.monthlyReport,
        notifyAnomaly:       next.anomaly,
      })
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 2000)
    } catch {
      setNotif(notif) // revert on error
    } finally {
      setSavingNotif(false)
    }
  }, [notif])

  // Change password
  async function handleChangePassword(e) {
    e.preventDefault()
    if (pwd.new !== pwd.confirm) { setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' }); return }
    if (pwd.new.length < 8)     { setPwdMsg({ type: 'error', text: 'Mật khẩu tối thiểu 8 ký tự' }); return }
    setSavingPwd(true)
    setPwdMsg(null)
    try {
      await authService.changePassword(pwd.old, pwd.new)
      setPwdMsg({ type: 'success', text: 'Đổi mật khẩu thành công' })
      setPwd({ old: '', new: '', confirm: '' })
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message })
    } finally {
      setSavingPwd(false)
    }
  }

  // Delete account
  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError('')
    try {
      await profileService.deleteAccount()   // xóa DynamoDB
      await authService.deleteUser()          // xóa Cognito
      logout()
    } catch (err) {
      setDeleteError(err.message ?? 'Xóa tài khoản thất bại')
      setDeleting(false)
    }
  }

  const notifItems = [
    { key: 'budgetAlert',   label: 'Vượt ngân sách',      desc: 'Nhận cảnh báo khi vượt hạn mức' },
    { key: 'monthlyReport', label: 'Báo cáo hàng tháng',  desc: 'Tóm tắt thu chi cuối tháng' },
    { key: 'anomaly',       label: 'Chi tiêu bất thường',  desc: 'Phát hiện giao dịch lạ' },
  ]

  return (
    <div className="space-y-5 max-w-2xl animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Cài đặt</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Quản lý tài khoản và tuỳ chọn</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader title="Thông tin cá nhân" subtitle="Cập nhật tên hiển thị" />
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-xl font-bold text-primary-600 dark:text-primary-400">
              {profileName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{profileName || user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Input label="Họ và tên" value={profileName} onChange={e => setProfileName(e.target.value)} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
            <input
              type="email" value={user?.email ?? ''} readOnly
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-gray-50 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500">Email không thể thay đổi</p>
          </div>
          <Alert {...(profileMsg ?? {})} />
          <Button type="submit" loading={savingProfile}>Lưu thay đổi</Button>
        </form>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader
          title="Thông báo"
          subtitle="Tuỳ chọn nhận thông báo qua email"
          action={
            notifSaved
              ? <span className="text-xs text-success-500">Đã lưu ✓</span>
              : savingNotif
                ? <span className="text-xs text-gray-400 dark:text-slate-500">Đang lưu...</span>
                : null
          }
        />
        <div className="space-y-1">
          {notifItems.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{label}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{desc}</p>
              </div>
              <Toggle checked={notif[key]} onChange={() => handleToggleNotif(key)} />
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader title="Bảo mật" subtitle="Đổi mật khẩu tài khoản" />
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Mật khẩu hiện tại" type="password" placeholder="••••••••"
            value={pwd.old} onChange={e => setPwd(p => ({ ...p, old: e.target.value }))} required />
          <Input label="Mật khẩu mới" type="password" placeholder="Tối thiểu 8 ký tự"
            value={pwd.new} onChange={e => setPwd(p => ({ ...p, new: e.target.value }))} required />
          <Input label="Xác nhận mật khẩu mới" type="password" placeholder="••••••••"
            value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} required />
          <Alert {...(pwdMsg ?? {})} />
          <Button type="submit" variant="secondary" loading={savingPwd}>Đổi mật khẩu</Button>
        </form>
      </Card>

      {/* Danger zone */}
      <Card className="border border-danger-200 dark:border-danger-900/50">
        <CardHeader title="Vùng nguy hiểm" />
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          Xóa tài khoản sẽ xóa vĩnh viễn toàn bộ dữ liệu của bạn. Không thể hoàn tác.
        </p>
        <Button variant="danger" size="sm" icon={Trash2} onClick={() => setShowDeleteModal(true)}>
          Xoá tài khoản
        </Button>
      </Card>

      {/* Delete confirmation modal */}
      <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteConfirm(''); setDeleteError('') }} title="Xác nhận xóa tài khoản">
        <div className="space-y-4">
          <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl p-4">
            <p className="text-sm text-danger-700 dark:text-danger-300 font-medium">⚠️ Hành động này không thể hoàn tác</p>
            <p className="text-sm text-danger-600 dark:text-danger-400 mt-1">
              Toàn bộ giao dịch, ngân sách, và dữ liệu tài chính sẽ bị xóa vĩnh viễn.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1.5">
              Nhập <span className="font-bold text-danger-500">XÓA</span> để xác nhận
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="XÓA"
              className="w-full rounded-lg border border-gray-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-danger-500"
            />
          </div>
          {deleteError && <p className="text-sm text-danger-600 dark:text-danger-400">{deleteError}</p>}
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); setDeleteError('') }} className="flex-1">
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              disabled={deleteConfirm !== 'XÓA'}
              onClick={handleDeleteAccount}
              className="flex-1"
            >
              Xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
