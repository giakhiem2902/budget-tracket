import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

const TITLES = {
  '/':             'Dashboard',
  '/transactions': 'Giao dịch',
  '/budgets':      'Ngân sách',
  '/reports':      'Báo cáo',
  '/settings':     'Cài đặt',
}

export function PageLayout() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Budget Tracket'

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64 overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
