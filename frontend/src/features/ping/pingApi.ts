import { baseApi } from '../../app/baseApi'

interface PingResponse {
  message: string
  environment: string
  serverTime: string
  version: string
}

export const pingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    ping: build.query<PingResponse, void>({
      query: () => '/ping',
    }),
  }),
})

export const { useLazyPingQuery } = pingApi
