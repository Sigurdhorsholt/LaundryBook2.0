import { useParams } from 'react-router-dom'
import { useMeQuery } from '../../../features/auth/authApi'

export function PropertyTimeslotsPage() {
  const { propertyId } = useParams()
  const { data: user } = useMeQuery()
  const property = user?.memberships.find((m) => m.propertyId === propertyId)

  return (
    <div className="p-4 p-lg-5">
      <div className="mb-5">
        <p className="mb-1" style={{ fontSize: '0.8rem', color: '#a0adb8', fontWeight: 500 }}>
          {property?.propertyName ?? 'Ejendom'}
        </p>
        <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem', color: '#0d1b2a' }}>Tidspladser</h1>
        <p className="mt-1 mb-0" style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>
          Tidspladsskabeloner gentages dagligt og gælder på ubestemt tid.
        </p>
      </div>

      <div
        className="rounded-3 d-flex flex-column align-items-center justify-content-center text-center p-5"
        style={{ border: '2px dashed #e8ecf0', minHeight: 240, maxWidth: 680 }}
      >
        <p className="fw-semibold mb-1" style={{ color: '#0d1b2a' }}>Ingen tidspladser endnu</p>
        <p style={{ color: '#5a6a7a', fontSize: '0.9rem', maxWidth: 360 }}>
          Denne funktion er under udvikling. Tidspladser kan oprettes når API'et er klar.
        </p>
      </div>
    </div>
  )
}
