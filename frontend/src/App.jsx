import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { PageLayout } from '@/components/layout/PageLayout'
import { Login } from '@/pages/Auth/Login'
import { Register } from '@/pages/Auth/Register'
import { ForgotPassword } from '@/pages/Auth/ForgotPassword'
import { Dashboard } from '@/pages/Dashboard'
import { Transactions } from '@/pages/Transactions'
import { Budgets } from '@/pages/Budgets'
import { Reports } from '@/pages/Reports'
import { Settings } from '@/pages/Settings'

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return !isAuthenticated ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route element={<PrivateRoute><PageLayout /></PrivateRoute>}>
        <Route index              element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets"      element={<Budgets />} />
        <Route path="reports"      element={<Reports />} />
        <Route path="settings"     element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
