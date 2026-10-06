import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AppNavbar } from './AppNavbar'
import { AppFooter } from './AppFooter'
import { PendingApprovalBanner } from './PendingApprovalBanner'
import { Spinner } from './ui'

export function AppLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <PendingApprovalBanner />
      <main className="flex-grow-1">
        {/* Inside the shell so the navbar stays put while a lazy page chunk loads */}
        <Suspense fallback={<Spinner fullPage />}>
          <Outlet />
        </Suspense>
      </main>
      <AppFooter />
    </div>
  )
}
