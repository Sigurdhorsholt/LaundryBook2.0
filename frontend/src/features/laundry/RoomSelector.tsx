import type { LaundryRoomDto } from './laundryApi'
import { colors } from '../../shared/theme'

interface Props {
  rooms: LaundryRoomDto[]
  selectedRoomId: string | null
  onSelect: (id: string) => void
}

export function RoomSelector({ rooms, selectedRoomId, onSelect }: Props) {
  if (rooms.length <= 1) return null

  return (
    <div className="mb-4 d-flex gap-2 flex-wrap">
      {rooms.map(room => (
        <button
          key={room.id}
          className="btn btn-sm"
          style={{
            borderRadius: 20, padding: '5px 16px', fontSize: '0.85rem', fontWeight: 500,
            backgroundColor: selectedRoomId === room.id ? colors.primary : colors.bgSubtle,
            color: selectedRoomId === room.id ? '#ffffff' : colors.textPrimary,
            border: 'none', transition: 'background-color 0.12s',
          }}
          onClick={() => onSelect(room.id)}
        >
          {room.name}
        </button>
      ))}
    </div>
  )
}
