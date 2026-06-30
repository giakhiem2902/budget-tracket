import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Wallet, KeyRound } from 'lucide-react'
import { authService } from '@/services/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Register() {
  const [step, setStep] = useState('register')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Mật khẩu xác nhận không khớp'); return }
    if (form.password.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự'); return }
    setLoading(true)
    try {
      await authService.register(form.name, form.email, form.password)
      setStep('confirm')
    } catch (err) {
      setError(err?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.confirmRegistration(form.email, code.trim())
      navigate('/login')
    } catch (err) {
      setError(err?.message ?? 'Xác thực thất bại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    try {
      await authService.resendConfirmationCode(form.email)
    } catch (err) {
      setError(err?.message)
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
          <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
            {step === 'register' ? 'Bắt đầu hành trình tài chính của bạn' : 'Xác thực tài khoản'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card dark:shadow-black/30 p-8">
          {step === 'register' ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Tạo tài khoản</h2>

              {error && (
                <div className="bg-danger-50 text-danger-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <Input label="Họ và tên" type="text" placeholder="Nguyễn Văn A" icon={User}
                  value={form.name} onChange={set('name')} required />
                <Input label="Email" type="email" placeholder="you@example.com" icon={Mail}
                  value={form.email} onChange={set('email')} required />
                <Input label="Mật khẩu" type="password" placeholder="Tối thiểu 8 ký tự" icon={Lock}
                  value={form.password} onChange={set('password')} required />
                <Input label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" icon={Lock}
                  value={form.confirm} onChange={set('confirm')} required />
                <Button type="submit" className="w-full" loading={loading}>Tạo tài khoản</Button>
              </form>

              <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary-500 font-medium hover:underline">Đăng nhập</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Xác thực email</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                Chúng tôi đã gửi mã 6 chữ số đến <span className="font-medium text-gray-700 dark:text-slate-200">{form.email}</span>
              </p>

              {error && (
                <div className="bg-danger-50 text-danger-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
              )}

              <form onSubmit={handleConfirm} className="space-y-4">
                <Input label="Mã xác thực" type="text" placeholder="123456" icon={KeyRound}
                  value={code} onChange={e => setCode(e.target.value)}
                  maxLength={6} required />
                <Button type="submit" className="w-full" loading={loading}>Xác nhận</Button>
              </form>

              <div className="flex items-center justify-between mt-4 text-sm">
                <button onClick={handleResend} className="text-primary-500 hover:underline">
                  Gửi lại mã
                </button>
                <button onClick={() => setStep('register')} className="text-gray-400 dark:text-slate-500 hover:underline">
                  Đổi email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
