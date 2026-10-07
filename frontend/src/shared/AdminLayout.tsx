import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { colors } from './theme'
import { Spinner } from './ui'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import { AppFooter } from './AppFooter'
import { PendingApprovalBanner } from './PendingApprovalBanner'
import { useOffcanvasAutoClose } from './utils/bootstrapUtils'

export function AdminLayout() {
  useOffcanvasAutoClose('adminSidebar')

  return (
    <div className="d-flex flex-column min-vh-100">
      <AdminHeader />

      <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
        {/* offcanvas-lg: static on ≥lg, slide-in panel on <lg */}
        <AdminSidebar />

        <main className="flex-grow-1" style={{ minWidth: 0, overflowX: 'hidden', backgroundColor: colors.bgPage }}>
          <PendingApprovalBanner />
          {/* Inside the shell so the sidebar stays put while a lazy page chunk loads */}
          <Suspense fallback={<Spinner fullPage />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <AppFooter />
    </div>
  )
}
