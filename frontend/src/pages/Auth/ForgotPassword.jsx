import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Wallet } from 'lucide-react'
import { authService } from '@/services/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm(e) {
    e.preventDefault()
    setError('')
    if (newPwd !== confirmPwd) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    if (newPwd.length < 8) {
      setError('Mật khẩu tối thiểu 8 ký tự')
      return
    }
    setLoading(true)
    try {
      await authService.confirmForgotPassword(email, code, newPwd)
      navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công. Đăng nhập để tiếp tục.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Budget<span className="text-primary-500">Tracket</span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Quản lý tài chính thông minh</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card dark:shadow-black/30 p-8">
          {step === 1 ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Quên mật khẩu</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Nhập email để nhận mã xác thực</p>

              {error && (
                <div className="bg-danger-50 text-danger-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
              )}

              <form onSubmit={handleSendCode} className="space-y-4">
                <Input label="Email" type="email" icon={Mail} placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
                <Button type="submit" className="w-full" loading={loading}>
                  Gửi mã xác thực
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Đặt lại mật khẩu</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                Kiểm tra email <span className="font-medium text-gray-700 dark:text-slate-200">{email}</span> để lấy mã xác thực
              </p>

              {error && (
                <div className="bg-danger-50 text-danger-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
              )}

              <form onSubmit={handleConfirm} className="space-y-4">
                <Input label="Mã xác thực" placeholder="123456"
                  value={code} onChange={e => setCode(e.target.value)} required />
                <Input label="Mật khẩu mới" type="password" icon={Lock} placeholder="Tối thiểu 8 ký tự"
                  value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
                <Input label="Xác nhận mật khẩu mới" type="password" placeholder="••••••••"
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
                <Button type="submit" className="w-full" loading={loading}>
                  Đặt lại mật khẩu
                </Button>
                <button type="button"
                  onClick={() => { setStep(1); setError('') }}
                  className="w-full text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-center mt-2">
                  Gửi lại mã xác thực
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
            <Link to="/login" className="text-primary-500 hover:underline">← Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
