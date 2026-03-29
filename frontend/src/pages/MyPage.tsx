import { useMeQuery } from '../features/auth/authApi'
import { PageHeader, Spinner } from '../shared/ui'
import { UserInfoForm } from '../features/profile/UserInfoForm'
import { BookingsOverview } from '../features/profile/BookingsOverview'

export function MyPage() {
  const { data: user, isLoading } = useMeQuery()
  const propertyId = user?.memberships[0]?.propertyId

  if (isLoading) return <Spinner fullPage />

  return (
    <div className="container-fluid px-3 px-lg-4 py-4" style={{ maxWidth: 1100 }}>
      <PageHeader title="Min side" />
      <div className="row g-4">
        <div className="col-lg-5">
          <UserInfoForm />
        </div>
        <div className="col-lg-7">
          {propertyId && <BookingsOverview propertyId={propertyId} />}
        </div>
      </div>
    </div>
  )
}
