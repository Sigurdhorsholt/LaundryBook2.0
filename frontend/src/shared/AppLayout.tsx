import { Outlet } from 'react-router-dom'
import { AppNavbar } from './AppNavbar'
import { PendingApprovalBanner } from './PendingApprovalBanner'

export function AppLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <PendingApprovalBanner />
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  )
}
