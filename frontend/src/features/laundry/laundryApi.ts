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
} = laundryApi
