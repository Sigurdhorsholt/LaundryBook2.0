import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  credentials: 'include', // send httpOnly cookies with every request
})

// A 401 from anything but the session check means the auth cookie expired mid-session. Re-checking
// the session lets ProtectedRoute swap the page for a login prompt instead of every action failing
// with a generic error. `me` itself is excluded so anonymous visitors don't trigger a refetch loop.
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401 && api.endpoint !== 'me') {
    api.dispatch(baseApi.util.invalidateTags(['Auth']))
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth', 'Property', 'User', 'Member', 'PendingInvite', 'InviteLink', 'LaundryRoom', 'LaundryMachine', 'TimeSlot', 'Booking'],
  endpoints: () => ({}),
})
