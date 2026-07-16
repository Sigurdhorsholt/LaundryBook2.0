import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import {
  BookingMode,
  BookingVisibility,
  useGetPropertyQuery,
  useUpdateComplexSettingsMutation,
} from '../../../features/properties/propertiesApi'
import type { ComplexSettingsDto } from '../../../features/properties/propertiesApi'
import { PageHeader, Spinner } from '../../../shared/ui'
import { colors } from '../../../shared/theme'

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
  const { t } = useTranslation()
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
      setSaveError(t('adminProperties.settings.saveError'))
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
        <p style={{ color: colors.dangerText, fontSize: '0.9rem' }}>
          {t('adminProperties.settings.loadError')}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 p-lg-5">
      <PageHeader
        eyebrow={property.name}
        title={t('adminProperties.settings.title')}
        description={t('adminProperties.settings.description')}
      />

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>

        {/* ── Booking type ──────────────────────────────────────────────── */}
        <SettingsSection
          title={t('adminProperties.settings.bookingType.title')}
          description={t('adminProperties.settings.bookingType.description')}
        >
          <div className="d-flex flex-column gap-2">
            <RadioCard
              selected={form.bookingMode === BookingMode.BookSpecificMachine}
              label={t('adminProperties.settings.bookingType.specificMachine')}
              description={t('adminProperties.settings.bookingType.specificMachineDesc')}
              onChange={() => patch({ bookingMode: BookingMode.BookSpecificMachine })}
            />
            <RadioCard
              selected={form.bookingMode === BookingMode.BookEntireRoom}
              label={t('adminProperties.settings.bookingType.entireRoom')}
              description={t('adminProperties.settings.bookingType.entireRoomDesc')}
              onChange={() => patch({ bookingMode: BookingMode.BookEntireRoom })}
            />
          </div>
        </SettingsSection>

        {/* ── Privacy — booking visibility ──────────────────────────────── */}
        <SettingsSection
          title={t('adminProperties.settings.visibility.title')}
          description={t('adminProperties.settings.visibility.description')}
        >
          <div className="d-flex flex-column gap-2">
            <RadioCard
              selected={form.bookingVisibility === BookingVisibility.ApartmentOnly}
              label={t('adminProperties.settings.visibility.apartmentOnly')}
              description={t('adminProperties.settings.visibility.apartmentOnlyDesc')}
              onChange={() => patch({ bookingVisibility: BookingVisibility.ApartmentOnly })}
            />
            <RadioCard
              selected={form.bookingVisibility === BookingVisibility.FullName}
              label={t('adminProperties.settings.visibility.fullName')}
              description={t('adminProperties.settings.visibility.fullNameDesc')}
              onChange={() => patch({ bookingVisibility: BookingVisibility.FullName })}
            />
            <RadioCard
              selected={form.bookingVisibility === BookingVisibility.Anonymous}
              label={t('adminProperties.settings.visibility.anonymous')}
              description={t('adminProperties.settings.visibility.anonymousDesc')}
              onChange={() => patch({ bookingVisibility: BookingVisibility.Anonymous })}
            />
          </div>
        </SettingsSection>

        {/* ── Booking horizon ───────────────────────────────────────────── */}
        <SettingsSection
          title={t('adminProperties.settings.lookahead.title')}
          description={t('adminProperties.settings.lookahead.description')}
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
            <span style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('adminProperties.settings.lookahead.unit')}</span>
          </div>
          {lookaheadError && (
            <p className="mt-1 mb-0" style={{ fontSize: '0.8rem', color: colors.dangerText }}>
              {t('adminProperties.settings.lookahead.rangeError', { max: MAX_LOOKAHEAD_DAYS })}
            </p>
          )}
        </SettingsSection>

        {/* ── Cancellation window ───────────────────────────────────────── */}
        <SettingsSection
          title={t('adminProperties.settings.cancellation.title')}
          description={t('adminProperties.settings.cancellation.description')}
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
            <span style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('adminProperties.settings.cancellation.unit')}</span>
            {!cancellationError && form.cancellationWindowHours === 0 && (
              <span style={{ fontSize: '0.82rem', color: colors.textMuted }}>{t('adminProperties.settings.cancellation.noLimit')}</span>
            )}
          </div>
          {cancellationError && (
            <p className="mt-1 mb-0" style={{ fontSize: '0.8rem', color: colors.dangerText }}>
              {t('adminProperties.settings.cancellation.rangeError', { max: MAX_CANCELLATION_HOURS })}
            </p>
          )}
        </SettingsSection>

        {/* ── Max concurrent bookings ───────────────────────────────────── */}
        <SettingsSection
          title={t('adminProperties.settings.maxConcurrent.title')}
          description={t('adminProperties.settings.maxConcurrent.description')}
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
            <span style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{t('adminProperties.settings.maxConcurrent.unit')}</span>
          </div>
          {maxBookingsError && (
            <p className="mt-1 mb-0" style={{ fontSize: '0.8rem', color: colors.dangerText }}>
              {t('adminProperties.settings.maxConcurrent.rangeError', { max: MAX_CONCURRENT_BOOKINGS })}
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
            {isSaving ? t('adminProperties.settings.saving') : t('adminProperties.settings.save')}
          </button>

          {isDirty && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={isSaving}
              onClick={handleReset}
            >
              {t('adminProperties.settings.undo')}
            </button>
          )}

          {saveSuccess && (
            <span style={{ fontSize: '0.85rem', color: colors.successText, fontWeight: 500 }}>{t('adminProperties.settings.saved')}</span>
          )}
          {saveError && (
            <span style={{ fontSize: '0.85rem', color: colors.dangerText }}>{saveError}</span>
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
      <h2 className="fw-semibold mb-1" style={{ fontSize: '1rem', color: colors.textPrimary }}>{title}</h2>
      <p className="mb-3" style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{description}</p>
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
  const borderColor = selected ? colors.primary : colors.borderDefault
  const bg = selected ? colors.primaryLighter : colors.bgCard

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
        style={{ marginTop: 3, accentColor: colors.primary, flexShrink: 0 }}
      />
      <div>
        <div className="fw-semibold" style={{ fontSize: '0.88rem', color: colors.textPrimary }}>{label}</div>
        <div style={{ fontSize: '0.82rem', color: colors.textSecondary, marginTop: 2 }}>{description}</div>
      </div>
    </label>
  )
}
