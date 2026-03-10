import { baseApi } from '../../app/baseApi'

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

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ userId: string }, { idToken: string }>({
      query: (body) => ({
        url: 'api/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    me: builder.query<CurrentUserDto, void>({
      query: () => 'api/auth/me',
      providesTags: ['Auth'],
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useMeQuery } = authApi
