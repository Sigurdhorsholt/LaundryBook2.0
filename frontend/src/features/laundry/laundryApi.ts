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
}

export interface LaundryMachineDto {
  id: string
  name: string
  machineType: MachineType
  isActive: boolean
}

export interface TimeSlotTemplateDto {
  id: string
  startTime: string   // "HH:mm:ss"
  endTime: string     // "HH:mm:ss"
  isActive: boolean
}

export interface BookingDto {
  id: string
  timeSlotTemplateId: string
  date: string          // "YYYY-MM-DD"
  isOwn: boolean
  label: string         // "Min booking" | "Anna Hansen" | "Lejl. 2B" | "Optaget"
  canCancel: boolean
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

    deleteLaundryRoom: build.mutation<void, { propertyId: string; roomId: string }>({
      query: ({ roomId }) => ({
        url: `/api/laundry-rooms/${roomId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { propertyId }) => [{ type: 'LaundryRoom', id: propertyId }],
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

    deleteMachine: build.mutation<void, { roomId: string; machineId: string; propertyId: string }>({
      query: ({ roomId, machineId }) => ({
        url: `/api/laundry-rooms/${roomId}/machines/${machineId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { roomId, propertyId }) => [
        { type: 'LaundryMachine', id: roomId },
        { type: 'LaundryRoom', id: propertyId },  // refresh machineCount
      ],
    }),

    // ── Time Slot Templates ───────────────────────────────────────────────────

    getTimeSlots: build.query<TimeSlotTemplateDto[], string>({
      query: (roomId) => `/api/laundry-rooms/${roomId}/timeslots`,
      providesTags: (_result, _err, roomId) => [{ type: 'TimeSlot', id: roomId }],
    }),

    createTimeSlot: build.mutation<{ id: string }, { roomId: string; startTime: string; endTime: string }>({
      query: ({ roomId, startTime, endTime }) => ({
        url: `/api/laundry-rooms/${roomId}/timeslots`,
        method: 'POST',
        body: { startTime, endTime },
      }),
      invalidatesTags: (_result, _err, { roomId }) => [{ type: 'TimeSlot', id: roomId }],
    }),

    deleteTimeSlot: build.mutation<void, { roomId: string; templateId: string }>({
      query: ({ roomId, templateId }) => ({
        url: `/api/laundry-rooms/${roomId}/timeslots/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { roomId }) => [{ type: 'TimeSlot', id: roomId }],
    }),

    // ── Bookings ─────────────────────────────────────────────────────────────

    getBookings: build.query<BookingDto[], { roomId: string; from: string; to: string }>({
      query: ({ roomId, from, to }) =>
        `/api/laundry-rooms/${roomId}/bookings?from=${from}&to=${to}`,
      providesTags: (_result, _err, { roomId }) => [{ type: 'Booking', id: roomId }],
    }),

    getMyBookings: build.query<MyBookingDto[], string>({
      query: (propertyId) => `/api/properties/${propertyId}/bookings/mine`,
      providesTags: (_result, _err, propertyId) => [{ type: 'Booking', id: `mine-${propertyId}` }],
    }),

    createBooking: build.mutation<{ id: string }, { roomId: string; propertyId: string; timeSlotTemplateId: string; date: string }>({
      query: ({ roomId, timeSlotTemplateId, date }) => ({
        url: `/api/laundry-rooms/${roomId}/bookings`,
        method: 'POST',
        body: { timeSlotTemplateId, date },
      }),
      invalidatesTags: (_result, _err, { roomId, propertyId }) => [
        { type: 'Booking', id: roomId },
        { type: 'Booking', id: `mine-${propertyId}` },
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
  useCreateTimeSlotMutation,
  useDeleteTimeSlotMutation,
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} = laundryApi
