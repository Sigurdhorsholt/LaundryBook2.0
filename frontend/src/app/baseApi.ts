import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include', // send httpOnly cookies with every request
  }),
  tagTypes: ['Auth', 'Property', 'LaundryRoom', 'LaundryMachine', 'TimeSlot', 'Booking'],
  endpoints: () => ({}),
})
