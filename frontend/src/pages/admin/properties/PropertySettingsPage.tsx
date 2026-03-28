import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  BookingMode,
  BookingVisibility,
  useGetPropertyQuery,
  useUpdateComplexSettingsMutation,
} from '../../../features/properties/propertiesApi'
import type { ComplexSettingsDto } from '../../../features/properties/propertiesApi'
import { PageHeader, Spinner } from '../../../shared/ui'

// Mirrors backend validation rules
const MAX_CANCELLATION_HOURS = 168 // 7 days
const MAX_LOOKAHEAD_DAYS = 30
const MAX_CONCURRENT_BOOKINGS = 10

interface FormState {
  bookingMode: BookingMode
  cancellationWindowHours: number   // frontend unit — converted to minutes on submit
  maxConcurrentBookingsPerUser: number
  bookingLookaheadDays: number
  bookingVisibility: BookingVisibility
}

function serverToForm(settings: ComplexSettingsDto): FormState {
  return {
    bookingMode: settings.bookingMode,
    cancellationWindowHours: settings.cancellationWindowMinutes / 60,
    maxConcurrentBookingsPerUser: settings.maxConcurrentBookingsPerUser,
    bookingLookaheadDays: settings.bookingLookaheadDays,
    bookingVisibility: settings.bookingVisibility,
  }
}

export function PropertySettingsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()

  const { data: property, isLoading, isError } = useGetPropertyQuery(propertyId!, { skip: !propertyId })
  const [updateSettings, { isLoading: isSaving }] = useUpdateComplexSettingsMutation()

  const [form, setForm] = useState<FormState>({
    bookingMode: BookingMode.BookSpecificMachine,
    cancellationWindowHours: 1,
    maxConcurrentBookingsPerUser: 2,
    bookingLookaheadDays: 14,
    bookingVisibility: BookingVisibility.ApartmentOnly,
  })
  const [isDirty, setIsDirty] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (property?.settings && !isDirty) {
      setForm(serverToForm(property.settings))
    }
  }, [property])

  function patch(update: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...update }))
    setIsDirty(true)
    setSaveSuccess(false)
    setSaveError(null)
  }

  function handleReset() {
    if (!property) return
    setForm(serverToForm(property.settings))
    setIsDirty(false)
    setSaveSuccess(false)
    setSaveError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await updateSettings({
        propertyId: propertyId!,
        bookingMode: form.bookingMode,
        cancellationWindowMinutes: Math.round(form.cancellationWindowHours * 60),
        maxConcurrentBookingsPerUser: form.maxConcurrentBookingsPerUser,
        bookingLookaheadDays: form.bookingLookaheadDays,
        bookingVisibility: form.bookingVisibility,
      }).unwrap()
      setSaveSuccess(true)
      setIsDirty(false)
    } catch {
      setSaveError('Kunne ikke gemme indstillinger. Prøv igen.')
    }
  }

  const cancellationError = form.cancellationWindowHours < 0 || form.cancellationWindowHours > MAX_CANCELLATION_HOURS
  const lookaheadError = form.bookingLookaheadDays < 1 || form.bookingLookaheadDays > MAX_LOOKAHEAD_DAYS
  const maxBookingsError = form.maxConcurrentBookingsPerUser < 1 || form.maxConcurrentBookingsPerUser > MAX_CONCURRENT_BOOKINGS
  const hasValidationError = cancellationError || lookaheadError || maxBookingsError

  if (isLoading) return <Spinner fullPage />

  if (isError || !property) {
    return (
      <div className="p-4 p-lg-5">
        <p style={{ color: '#dc3545', fontSize: '0.9rem' }}>
          Kunne ikke indlæse indstillinger. Prøv at genindlæse siden.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={property.name}
        title="Indstillinger"
        description="Gælder for alle beboere i denne ejendom."
      />

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>

        {/* ── Booking type ──────────────────────────────────────────────── */}
        <SettingsSection
          title="Bookingtype"
          description="Bestemmer om beboerne booker et helt lokale eller en specifik maskine."
        >
          <div className="d-flex flex-column gap-2">
            <RadioCard
              selected={form.bookingMode === BookingMode.BookSpecificMachine}
              label="Specifik maskine"
              description="Beboeren vælger præcis hvilken maskine eller tørretumbler de vil bruge."
              onChange={() => patch({ bookingMode: BookingMode.BookSpecificMachine })}
            />
            <RadioCard
              selected={form.bookingMode === BookingMode.BookEntireRoom}
              label="Helt lokale"
              description="Beboeren booker adgang til hele vaskerummet i det valgte tidsrum."
              onChange={() => patch({ bookingMode: BookingMode.BookEntireRoom })}
            />
          </div>
        </SettingsSection>

        {/* ── Privacy — booking visibility ──────────────────────────────── */}
        <SettingsSection
          title="Synlighed i bookingkalenderen"
          description="Hvad ser andre beboere, når de kigger i bookingkalenderen?"
        >
          <div className="d-flex flex-column gap-2">
            <RadioCard
              selected={form.bookingVisibility === BookingVisibility.ApartmentOnly}
              label="Lejlighedsnummer"
              description='Andre beboere ser "Lejl. 1A" — navne vises ikke.'
              onChange={() => patch({ bookingVisibility: BookingVisibility.ApartmentOnly })}
            />
            <RadioCard
              selected={form.bookingVisibility === BookingVisibility.FullName}
              label="Fuldt navn"
              description='Andre beboere ser beboerens fulde navn, fx "Anna Larsen".'
              onChange={() => patch({ bookingVisibility: BookingVisibility.FullName })}
            />
            <RadioCard
              selected={form.bookingVisibility === BookingVisibility.Anonymous}
              label="Anonymt"
              description='Andre beboere ser kun "Optaget" — maksimal privatliv.'
              onChange={() => patch({ bookingVisibility: BookingVisibility.Anonymous })}
            />
          </div>
        </SettingsSection>

        {/* ── Booking horizon ───────────────────────────────────────────── */}
        <SettingsSection
          title="Fremtidshorisont"
          description="Hvor mange dage frem kan beboere oprette bookinger? (1–30)"
        >
          <div className="d-flex align-items-center gap-3">
            <input
              type="number"
              className={`form-control${lookaheadError ? ' is-invalid' : ''}`}
              style={{ width: 90 }}
              min={1}
              max={MAX_LOOKAHEAD_DAYS}
              value={form.bookingLookaheadDays}
              onChange={(e) => patch({ bookingLookaheadDays: Number(e.target.value) })}
            />
            <span style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>dage</span>
          </div>
          {lookaheadError && (
            <p className="mt-1 mb-0" style={{ fontSize: '0.8rem', color: '#dc3545' }}>
              Skal være mellem 1 og {MAX_LOOKAHEAD_DAYS} dage.
            </p>
          )}
        </SettingsSection>

        {/* ── Cancellation window ───────────────────────────────────────── */}
        <SettingsSection
          title="Afbestillingsfrist"
          description="Beboere kan afbestille op til dette antal timer inden tidspladsen starter. Sæt til 0 for ingen frist."
        >
          <div className="d-flex align-items-center gap-3">
            <input
              type="number"
              className={`form-control${cancellationError ? ' is-invalid' : ''}`}
              style={{ width: 90 }}
              min={0}
              max={MAX_CANCELLATION_HOURS}
              step={0.5}
              value={form.cancellationWindowHours}
              onChange={(e) => patch({ cancellationWindowHours: Number(e.target.value) })}
            />
            <span style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>timer</span>
            {!cancellationError && form.cancellationWindowHours === 0 && (
              <span style={{ fontSize: '0.82rem', color: '#a0adb8' }}>Ingen frist</span>
            )}
          </div>
          {cancellationError && (
            <p className="mt-1 mb-0" style={{ fontSize: '0.8rem', color: '#dc3545' }}>
              Skal være mellem 0 og {MAX_CANCELLATION_HOURS} timer.
            </p>
          )}
        </SettingsSection>

        {/* ── Max concurrent bookings ───────────────────────────────────── */}
        <SettingsSection
          title="Maks. aktive bookinger pr. beboer"
          description="Hvor mange kommende bookinger en beboer må have på samme tid. (1–10)"
        >
          <div className="d-flex align-items-center gap-3">
            <input
              type="number"
              className={`form-control${maxBookingsError ? ' is-invalid' : ''}`}
              style={{ width: 90 }}
              min={1}
              max={MAX_CONCURRENT_BOOKINGS}
              value={form.maxConcurrentBookingsPerUser}
              onChange={(e) => patch({ maxConcurrentBookingsPerUser: Number(e.target.value) })}
            />
            <span style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>bookinger</span>
          </div>
          {maxBookingsError && (
            <p className="mt-1 mb-0" style={{ fontSize: '0.8rem', color: '#dc3545' }}>
              Skal være mellem 1 og {MAX_CONCURRENT_BOOKINGS}.
            </p>
          )}
        </SettingsSection>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="d-flex align-items-center gap-3 pt-2">
          <button
            type="submit"
            className="btn btn-primary fw-semibold"
            disabled={isSaving || !isDirty || hasValidationError}
          >
            {isSaving ? 'Gemmer…' : 'Gem indstillinger'}
          </button>

          {isDirty && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={isSaving}
              onClick={handleReset}
            >
              Fortryd
            </button>
          )}

          {saveSuccess && (
            <span style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 500 }}>Gemt ✓</span>
          )}
          {saveError && (
            <span style={{ fontSize: '0.85rem', color: '#dc3545' }}>{saveError}</span>
          )}
        </div>
      </form>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-5">
      <h2 className="fw-semibold mb-1" style={{ fontSize: '1rem', color: '#0d1b2a' }}>{title}</h2>
      <p className="mb-3" style={{ fontSize: '0.85rem', color: '#5a6a7a' }}>{description}</p>
      {children}
    </section>
  )
}

function RadioCard({
  selected,
  label,
  description,
  onChange,
}: {
  selected: boolean
  label: string
  description: string
  onChange: () => void
}) {
  const borderColor = selected ? '#1565c0' : '#e8ecf0'
  const bg = selected ? '#f0f5ff' : '#ffffff'

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 10,
        border: `1.5px solid ${borderColor}`,
        backgroundColor: bg,
        cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      <input
        type="radio"
        checked={selected}
        onChange={onChange}
        style={{ marginTop: 3, accentColor: '#1565c0', flexShrink: 0 }}
      />
      <div>
        <div className="fw-semibold" style={{ fontSize: '0.88rem', color: '#0d1b2a' }}>{label}</div>
        <div style={{ fontSize: '0.82rem', color: '#5a6a7a', marginTop: 2 }}>{description}</div>
      </div>
    </label>
  )
}
