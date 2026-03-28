import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
    credentials: 'include', // send httpOnly cookies with every request
  }),
  tagTypes: ['Auth', 'Property', 'User', 'LaundryRoom', 'LaundryMachine', 'TimeSlot', 'Booking'],
  endpoints: () => ({}),
})
