import { baseApi } from '../../app/baseApi'
import { UserRole } from '../auth/authApi'

export interface SysAdminUserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  membershipCount: number
}

export interface PagedUsersResult {
  items: SysAdminUserDto[]
  totalCount: number
}

export interface UserPropertyMembershipDto {
  propertyId: string
  propertyName: string
  role: UserRole
  apartmentNumber: string | null
  isActive: boolean
}

export interface SysAdminUserDetailDto {
  id: string
  email: string
  firstName: string
  lastName: string
  memberships: UserPropertyMembershipDto[]
}

export const sysAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUsers: build.query<PagedUsersResult, { search?: string; page: number; pageSize?: number }>({
      query: ({ search, page, pageSize = 10 }) => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
        if (search) params.set('search', search)
        return `/api/sysadmin/users?${params}`
      },
      providesTags: (result) =>
        result
          ? [...result.items.map((u) => ({ type: 'User' as const, id: u.id })), { type: 'User' as const, id: 'LIST' }]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    getUserWithMemberships: build.query<SysAdminUserDetailDto, string>({
      query: (userId) => `/api/sysadmin/users/${userId}`,
      providesTags: (_result, _err, userId) => [{ type: 'User', id: userId }],
    }),

    assignUserToProperty: build.mutation<void, { userId: string; propertyId: string; role: UserRole; apartmentNumber: string | null }>({
      query: ({ userId, ...body }) => ({
        url: `/api/sysadmin/users/${userId}/memberships`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetAllUsersQuery,
  useGetUserWithMembershipsQuery,
  useAssignUserToPropertyMutation,
} = sysAdminApi
