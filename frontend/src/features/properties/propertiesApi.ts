import { baseApi } from '../../app/baseApi'

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
  members: unknown[]
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
    getProperty: build.query<PropertyDetailDto, string>({
      query: (id) => `/api/properties/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Property', id }],
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

export const { useGetPropertyQuery, useUpdateComplexSettingsMutation } = propertiesApi
