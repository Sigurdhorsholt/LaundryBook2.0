import type { LaundryRoomDto } from './laundryApi'

interface Props {
  rooms: LaundryRoomDto[]
  selectedRoomId: string | null
  onSelect: (id: string) => void
}

export function RoomSelector({ rooms, selectedRoomId, onSelect }: Props) {
  if (rooms.length <= 1) return null

  return (
    <div className="mb-4 d-flex gap-2 flex-wrap">
      {rooms.map(room => {
        const active = selectedRoomId === room.id
        return (
          <button
            key={room.id}
            className={`lb-btn ${active ? 'lb-btn-primary' : 'lb-btn-ghost'}`}
            style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: active ? 600 : 500 }}
            onClick={() => onSelect(room.id)}
          >
            {room.name}
          </button>
        )
      })}
    </div>
  )
}
