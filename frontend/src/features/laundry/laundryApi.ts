import { baseApi } from '../../app/baseApi'

export enum MachineType {
  Washer = 0,
  Dryer = 1,
  WasherDryer = 2,
}

export interface LaundryRoomDto {
  id: string
  name: string
  description: string | null
  isActive: boolean
  machineCount: number
  timeSlotCount: number
  upcomingBookingCount: number
}

export interface LaundryMachineDto {
  id: string
  name: string
  machineType: MachineType
  isActive: boolean
  upcomingBookingCount: number
}

export interface TimeSlotTemplateDto {
  id: string
  startTime: string   // "HH:mm:ss"
  endTime: string     // "HH:mm:ss"
  isActive: boolean
  upcomingBookingCount: number
}

export interface TimeSlotScheduleEntry {
  id: string | null   // null = create new
  startTime: string
  endTime: string
}

// How another resident's booking is named, per the property's visibility setting
export enum BookingLabelKind {
  Own = 0,
  Name = 1,
  Apartment = 2,
  Anonymous = 3,
}

export interface BookingDto {
  id: string
  timeSlotTemplateId: string
  date: string          // "YYYY-MM-DD"
  isOwn: boolean
  labelKind: BookingLabelKind
  labelValue: string | null   // the name or apartment number; null for Own and Anonymous
  canCancel: boolean
  machineId: string | null
  machineName: string | null
}

export interface MyBookingDto {
  id: string
  roomId: string
  roomName: string
  timeSlotTemplateId: string
  startTime: string     // "HH:mm:ss"
  endTime: string       // "HH:mm:ss"
  date: string          // "YYYY-MM-DD"
  canCancel: boolean
  machineName: string | null
}

// A booking the board cancelled that the resident hasn't acknowledged yet
export interface CancellationNoticeDto {
  bookingId: string
  date: string        // "YYYY-MM-DD"
  startTime: string   // "HH:mm:ss"
  endTime: string     // "HH:mm:ss"
  roomName: string
  machineName: string | null
}

export interface AdminBookingDto {
  id: string
  roomId: string
  roomName: string
  timeSlotTemplateId: string
  date: string          // "YYYY-MM-DD"
  startTime: string     // "HH:mm:ss"
  endTime: string       // "HH:mm:ss"
  userId: string
  residentName: string
  apartmentNumber: string | null
  machineName: string | null
}

export interface AdminRoomSummaryDto {
  id: string
  name: string
  isActive: boolean
  activeSlotCount: number
  capacityPerSlot: number
}

export interface PropertyBookingsDto {
  bookings: AdminBookingDto[]
  rooms: AdminRoomSummaryDto[]
}

export const laundryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // ── Rooms ────────────────────────────────────────────────────────────────

    getLaundryRooms: build.query<LaundryRoomDto[], string>({
      query: (propertyId) => `/api/properties/${propertyId}/laundry-rooms`,
      providesTags: (_result, _err, propertyId) => [{ type: 'LaundryRoom', id: propertyId }],
    }),

    createLaundryRoom: build.mutation<{ id: string }, { propertyId: string; name: string; description: string | null }>({
      query: ({ propertyId, ...body }) => ({
        url: `/api/properties/${propertyId}/laundry-rooms`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { propertyId }) => [{ type: 'LaundryRoom', id: propertyId }],
    }),

    updateLaundryRoom: build.mutation<void, { propertyId: string; roomId: string; name: string; description: string | null }>({
      query: ({ roomId, name, description }) => ({
        url: `/api/laundry-rooms/${roomId}`,
        method: 'PUT',
        body: { name, description },
      }),
      invalidatesTags: (_result, _err, { propertyId }) => [{ type: 'LaundryRoom', id: propertyId }],
    }),

    deleteLaundryRoom: build.mutation<{ cancelledBookings: number }, { propertyId: string; roomId: string }>({
      query: ({ roomId }) => ({
        url: `/api/laundry-rooms/${roomId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { propertyId, roomId }) => [
        { type: 'LaundryRoom', id: propertyId },
        { type: 'Booking', id: roomId },
        { type: 'Booking', id: `mine-${propertyId}` },
        { type: 'Booking', id: `admin-${propertyId}` },
      ],
    }),

    // ── Machines ─────────────────────────────────────────────────────────────

    getMachines: build.query<LaundryMachineDto[], string>({
      query: (roomId) => `/api/laundry-rooms/${roomId}/machines`,
      providesTags: (_result, _err, roomId) => [{ type: 'LaundryMachine', id: roomId }],
    }),

    createMachine: build.mutation<{ id: string }, { roomId: string; name: string; machineType: MachineType }>({
      query: ({ roomId, ...body }) => ({
        url: `/api/laundry-rooms/${roomId}/machines`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { roomId }) => [
        { type: 'LaundryMachine', id: roomId },
        { type: 'LaundryRoom' },  // refresh machineCount on room list
      ],
    }),

    updateMachine: build.mutation<void, { roomId: string; machineId: string; name: string; machineType: MachineType }>({
      query: ({ roomId, machineId, name, machineType }) => ({
        url: `/api/laundry-rooms/${roomId}/machines/${machineId}`,
        method: 'PUT',
        body: { name, machineType },
      }),
      invalidatesTags: (_result, _err, { roomId }) => [{ type: 'LaundryMachine', id: roomId }],
    }),

    deleteMachine: build.mutation<{ cancelledBookings: number }, { roomId: string; machineId: string; propertyId: string }>({
      query: ({ roomId, machineId }) => ({
        url: `/api/laundry-rooms/${roomId}/machines/${machineId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { roomId, propertyId }) => [
        { type: 'LaundryMachine', id: roomId },
        { type: 'LaundryRoom', id: propertyId },  // refresh machineCount + upcomingBookingCount
        { type: 'Booking', id: roomId },
        { type: 'Booking', id: `mine-${propertyId}` },
        { type: 'Booking', id: `admin-${propertyId}` },
      ],
    }),

    // ── Time Slot Templates ───────────────────────────────────────────────────

    getTimeSlots: build.query<TimeSlotTemplateDto[], string>({
      query: (roomId) => `/api/laundry-rooms/${roomId}/timeslots`,
      providesTags: (_result, _err, roomId) => [{ type: 'TimeSlot', id: roomId }],
    }),

    replaceTimeSlots: build.mutation<
      { cancelledBookings: number },
      { roomId: string; propertyId: string; slots: TimeSlotScheduleEntry[] }
    >({
      query: ({ roomId, slots }) => ({
        url: `/api/laundry-rooms/${roomId}/timeslots`,
        method: 'PUT',
        body: { slots },
      }),
      invalidatesTags: (_result, _err, { roomId, propertyId }) => [
        { type: 'TimeSlot', id: roomId },
        { type: 'LaundryRoom', id: propertyId },  // refresh timeSlotCount
        { type: 'Booking', id: roomId },
        { type: 'Booking', id: `mine-${propertyId}` },
        { type: 'Booking', id: `admin-${propertyId}` },
      ],
    }),

    // ── Bookings ─────────────────────────────────────────────────────────────

    getBookings: build.query<BookingDto[], { roomId: string; from: string; to: string }>({
      query: ({ roomId, from, to }) =>
        `/api/laundry-rooms/${roomId}/bookings?from=${from}&to=${to}`,
      providesTags: (_result, _err, { roomId }) => [{ type: 'Booking', id: roomId }],
    }),

    getCancellationNotices: build.query<CancellationNoticeDto[], void>({
      query: () => '/api/bookings/cancellation-notices',
      providesTags: [{ type: 'Booking', id: 'cancellation-notices' }],
    }),

    acknowledgeCancellationNotices: build.mutation<void, string[]>({
      query: (bookingIds) => ({
        url: '/api/bookings/cancellation-notices/acknowledge',
        method: 'POST',
        body: { bookingIds },
      }),
      invalidatesTags: [{ type: 'Booking', id: 'cancellation-notices' }],
    }),

    getMyBookings: build.query<MyBookingDto[], string>({
      query: (propertyId) => `/api/properties/${propertyId}/bookings/mine`,
      providesTags: (_result, _err, propertyId) => [{ type: 'Booking', id: `mine-${propertyId}` }],
    }),

    // Bookings before today, newest first. Nothing the resident does changes the past, so no tag invalidates it.
    getMyBookingHistory: build.query<MyBookingDto[], string>({
      query: (propertyId) => `/api/properties/${propertyId}/bookings/mine/history`,
    }),

    getPropertyBookings: build.query<PropertyBookingsDto, { propertyId: string; from: string; to: string }>({
      query: ({ propertyId, from, to }) =>
        `/api/properties/${propertyId}/bookings?from=${from}&to=${to}`,
      providesTags: (_result, _err, { propertyId }) => [{ type: 'Booking', id: `admin-${propertyId}` }],
    }),

    createBooking: build.mutation<{ id: string }, { roomId: string; propertyId: string; timeSlotTemplateId: string; date: string; machineId?: string | null }>({
      query: ({ roomId, timeSlotTemplateId, date, machineId }) => ({
        url: `/api/laundry-rooms/${roomId}/bookings`,
        method: 'POST',
        body: { timeSlotTemplateId, date, machineId: machineId ?? null },
      }),
      invalidatesTags: (_result, _err, { roomId, propertyId }) => [
        { type: 'Booking', id: roomId },
        { type: 'Booking', id: `mine-${propertyId}` },
        { type: 'Booking', id: `admin-${propertyId}` },
      ],
    }),

    cancelBooking: build.mutation<void, { bookingId: string; roomId: string; propertyId: string }>({
      query: ({ bookingId }) => ({
        url: `/api/bookings/${bookingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { roomId, propertyId }) => [
        { type: 'Booking', id: roomId },
        { type: 'Booking', id: `mine-${propertyId}` },
        { type: 'Booking', id: `admin-${propertyId}` },
      ],
    }),
  }),
})

export const {
  useGetLaundryRoomsQuery,
  useCreateLaundryRoomMutation,
  useUpdateLaundryRoomMutation,
  useDeleteLaundryRoomMutation,
  useGetMachinesQuery,
  useCreateMachineMutation,
  useUpdateMachineMutation,
  useDeleteMachineMutation,
  useGetTimeSlotsQuery,
  useReplaceTimeSlotsMutation,
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useGetMyBookingHistoryQuery,
  useGetCancellationNoticesQuery,
  useAcknowledgeCancellationNoticesMutation,
  useGetPropertyBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} = laundryApi
