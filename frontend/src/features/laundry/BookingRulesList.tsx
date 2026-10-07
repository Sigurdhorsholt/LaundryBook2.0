import { useTranslation } from 'react-i18next'
import { BookingMode } from '../properties/propertiesApi'
import { colors } from '../../shared/theme'
import type { RoomRules } from './types'

interface Props {
  rules: RoomRules
  // Only the property page explains the booking mode; beside the times it is self-evident
  bookingMode?: BookingMode
  fontSize?: string
}

export function BookingRulesList({ rules, bookingMode, fontSize = '0.85rem' }: Props) {
  const { t } = useTranslation()
  const cancelHours = Math.round(rules.cancellationWindowMinutes / 60)

  return (
    <ul className="mb-0 ps-3 d-flex flex-column gap-1" style={{ fontSize, color: colors.textSecondary }}>
      {bookingMode !== undefined && (
        <li>{bookingMode === BookingMode.BookSpecificMachine ? t('laundry.room.modeMachine') : t('laundry.room.modeRoom')}</li>
      )}
      <li>{t('laundry.room.lookahead', { count: rules.lookaheadDays })}</li>
      <li>{t('laundry.room.maxBookings', { count: rules.maxBookings })}</li>
      <li>{cancelHours > 0 ? t('laundry.room.cancelHours', { count: cancelHours }) : t('laundry.room.cancelUntilStart')}</li>
    </ul>
  )
}
