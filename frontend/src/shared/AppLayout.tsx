import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { ResidentHeader } from './ResidentHeader'
import { BottomTabBar } from './BottomTabBar'
import { AppFooter } from './AppFooter'
import { PendingApprovalBanner } from './PendingApprovalBanner'
import { Spinner } from './ui'
import { colors } from './theme'

export function AppLayout() {
  return (
    <div className="d-flex flex-column min-vh-100 resident-shell" style={{ backgroundColor: colors.bgPage }}>
      <ResidentHeader />
      <PendingApprovalBanner />
      <main className="flex-grow-1">
        {/* Inside the shell so the navbar stays put while a lazy page chunk loads */}
        <Suspense fallback={<Spinner fullPage />}>
          <Outlet />
        </Suspense>
      </main>
      <AppFooter />
      <BottomTabBar />
    </div>
  )
}
