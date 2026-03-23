import { baseApi } from '../../app/baseApi'

// @ts-ignore
export enum UserRole {
  Resident = 0,
  ComplexAdmin = 1,
  OrgAdmin = 2,
  SysAdmin = 3,
}

export interface UserComplexMembershipDto {
  propertyId: string
  propertyName: string
  role: UserRole
  apartmentNumber: string | null
}

export interface CurrentUserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  memberships: UserComplexMembershipDto[]
}

export interface InviteInfoDto {
  role: number
  isMultiUse: boolean
  apartmentNumber: string | null
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ userId: string }, { idToken: string }>({
      query: (body) => ({
        url: '/api/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    me: builder.query<CurrentUserDto, void>({
      query: () => '/api/auth/me',
      providesTags: ['Auth'],
    }),

    getInviteInfo: builder.query<InviteInfoDto, string>({
      query: (token) => `/api/auth/invite-info?token=${encodeURIComponent(token)}`,
    }),

    redeemInvite: builder.mutation<{ userId: string }, { idToken: string; inviteToken: string; apartmentNumber?: string }>({
      query: (body) => ({
        url: '/api/auth/redeem-invite',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useGetInviteInfoQuery,
  useRedeemInviteMutation,
} = authApi
