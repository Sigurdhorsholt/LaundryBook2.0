import { baseApi } from '../../app/baseApi'
import type { MachineType } from '../laundry/laundryApi'

export enum BookingMode {
  BookEntireRoom = 0,
  BookSpecificMachine = 1,
}

export enum BookingVisibility {
  FullName = 0,       // Show full name to other residents
  ApartmentOnly = 1,  // Show only apartment number (default)
  Anonymous = 2,      // Show only "Optaget"
}

export interface ComplexSettingsDto {
  bookingMode: BookingMode
  cancellationWindowMinutes: number
  maxConcurrentBookingsPerUser: number
  bookingLookaheadDays: number
  bookingVisibility: BookingVisibility
}

export interface PropertyDto {
  id: string
  name: string
  address: string
  settings: ComplexSettingsDto
  memberCount: number
}

export interface PropertyDetailDto {
  id: string
  name: string
  address: string
  settings: ComplexSettingsDto
  upcomingBookingCount: number
}

export interface BoardMemberDto {
  name: string
  email: string
}

export interface PropertyRoomInfoDto {
  id: string
  name: string
  description: string | null
  machines: { name: string; machineType: MachineType }[]
}

// Everything a resident needs to know about their building, from one request
export interface PropertyInfoDto {
  id: string
  name: string
  address: string
  board: BoardMemberDto[]
  rooms: PropertyRoomInfoDto[]
  settings: ComplexSettingsDto
}

export interface UpdateComplexSettingsRequest {
  bookingMode: BookingMode
  cancellationWindowMinutes: number
  maxConcurrentBookingsPerUser: number
  bookingLookaheadDays: number
  bookingVisibility: BookingVisibility
}

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyProperties: build.query<PropertyDto[], void>({
      query: () => '/api/properties',
      providesTags: [{ type: 'Property', id: 'LIST' }],
    }),

    createProperty: build.mutation<{ id: string }, { name: string; address: string }>({
      query: (body) => ({
        url: '/api/properties',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Property', id: 'LIST' }],
    }),

    getProperty: build.query<PropertyDetailDto, string>({
      query: (id) => `/api/properties/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Property', id }],
    }),

    getPropertyInfo: build.query<PropertyInfoDto, string>({
      query: (id) => `/api/properties/${id}/info`,
      // Admin edits to rooms, machines and settings invalidate these, so residents never see stale info
      providesTags: (result, _err, id) => [
        { type: 'Property', id },
        { type: 'LaundryRoom', id },
        { type: 'Member', id },
        ...(result?.rooms.map((r) => ({ type: 'LaundryMachine' as const, id: r.id })) ?? []),
      ],
    }),

    updateComplexSettings: build.mutation<void, { propertyId: string } & UpdateComplexSettingsRequest>({
      query: ({ propertyId, ...body }) => ({
        url: `/api/properties/${propertyId}/settings`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { propertyId }) => [
        { type: 'Property', id: propertyId },
      ],
    }),
  }),
})

export const {
  useGetMyPropertiesQuery,
  useCreatePropertyMutation,
  useGetPropertyQuery,
  useGetPropertyInfoQuery,
  useUpdateComplexSettingsMutation,
} = propertiesApi
