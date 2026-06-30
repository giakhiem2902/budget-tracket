import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Wallet } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMsg = location.state?.message

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err?.message ?? 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Budget<span className="text-primary-500">Tracket</span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Quản lý tài chính thông minh</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card dark:shadow-black/30 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">Đăng nhập</h2>

          {successMsg && (
            <div className="bg-success-50 text-success-600 text-sm px-4 py-3 rounded-xl mb-4">
              {successMsg}
            </div>
          )}
          {error && (
            <div className="bg-danger-50 text-danger-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={set('email')}
              required
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.password}
              onChange={set('password')}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded" /> Nhớ tôi
              </label>
              <Link to="/forgot-password" className="text-primary-500 hover:underline">Quên mật khẩu?</Link>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Đăng nhập
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-500 font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
