import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'

function Alert({ type, text }) {
  if (!text) return null
  return (
    <p className={`text-sm mt-1 ${type === 'success' ? 'text-success-600' : 'text-danger-600'}`}>
      {text}
    </p>
  )
}

export function Settings() {
  const { user, updateUser } = useAuth()
  const [profileName, setProfileName] = useState(user?.name ?? '')
  const [profileMsg, setProfileMsg] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [pwd, setPwd] = useState({ old: '', new: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState(null)
  const [savingPwd, setSavingPwd] = useState(false)

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      await authService.updateName(profileName)
      updateUser({ name: profileName })
      setProfileMsg({ type: 'success', text: 'Đã cập nhật tên thành công' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message })
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (pwd.new !== pwd.confirm) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' })
      return
    }
    if (pwd.new.length < 8) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu tối thiểu 8 ký tự' })
      return
    }
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

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cài đặt</h2>
        <p className="text-sm text-gray-500 mt-0.5">Quản lý tài khoản và tuỳ chọn</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader title="Thông tin cá nhân" subtitle="Cập nhật tên hiển thị" />
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600">
              {profileName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{profileName || user?.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          <Input label="Họ và tên" value={profileName}
            onChange={e => setProfileName(e.target.value)} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
          </div>
          <Alert {...(profileMsg ?? {})} />
          <Button type="submit" loading={savingProfile}>Lưu thay đổi</Button>
        </form>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader title="Thông báo" subtitle="Tuỳ chọn nhận thông báo qua email" />
        <div className="space-y-4">
          {[
            { label: 'Vượt ngân sách',     desc: 'Nhận cảnh báo khi vượt hạn mức', key: 'budgetAlert' },
            { label: 'Báo cáo hàng tháng', desc: 'Tóm tắt thu chi cuối tháng',     key: 'monthlyReport' },
            { label: 'Chi tiêu bất thường', desc: 'Phát hiện giao dịch lạ',          key: 'anomaly' },
          ].map(({ label, desc, key }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500
                  peer-focus:ring-2 peer-focus:ring-primary-300 transition-colors
                  after:content-[''] after:absolute after:top-0.5 after:left-0.5
                  after:bg-white after:rounded-full after:h-5 after:w-5
                  after:transition-all peer-checked:after:translate-x-5" />
              </label>
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
      <Card className="border border-danger-100">
        <CardHeader title="Vùng nguy hiểm" />
        <p className="text-sm text-gray-500 mb-4">Các hành động này không thể hoàn tác.</p>
        <Button variant="danger" size="sm" type="button">Xoá tài khoản</Button>
      </Card>
    </div>
  )
}
