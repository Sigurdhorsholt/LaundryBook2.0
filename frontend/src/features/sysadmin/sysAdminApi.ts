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

// Counted on the server only when a user is opened
export interface UserActivityDto {
  upcomingBookings: number
  bookingsLast90Days: number
  totalBookings: number
  loggedChanges: number
  lastLoggedChangeAt: string | null
}

export interface SysAdminUserDetailDto {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  lastSeenAt: string | null
  termsAcceptedAt: string | null
  activity: UserActivityDto
  memberships: UserPropertyMembershipDto[]
}

export interface PendingPropertyDto {
  id: string
  name: string
  address: string
  createdAt: string
  adminName: string | null
  adminEmail: string | null
}

// Every property on the platform, with the numbers /system shows
export interface SystemPropertyDto {
  id: string
  name: string
  address: string
  isActive: boolean
  createdAt: string
  members: number
  admins: number
  rooms: number
  bookingsLast30Days: number
  bookingsNext7Days: number
}

export type SystemInviteStatus = 'Pending' | 'Expired' | 'SharedLink'

// An unused invite on any property; createdBy comes from the audit log and can be missing
export interface SystemInviteDto {
  id: string
  propertyId: string
  propertyName: string
  email: string | null
  apartmentNumber: string | null
  role: UserRole
  isMultiUse: boolean
  createdAt: string
  expiresAt: string
  createdBy: string | null
}

export interface AuditLogDto {
  id: string
  timestampUtc: string
  userId: string | null
  userEmail: string | null
  action: string
  entityType: string
  entityId: string
  changes: string | null
}

export interface PagedAuditLogsResult {
  items: AuditLogDto[]
  totalCount: number
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

    deleteUser: build.mutation<void, string>({
      query: (userId) => ({ url: `/api/sysadmin/users/${userId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
        { type: 'Property', id: 'SYSTEM' },
      ],
    }),

    getPendingProperties: build.query<PendingPropertyDto[], void>({
      query: () => '/api/sysadmin/pending-properties',
      providesTags: [{ type: 'Property', id: 'PENDING' }],
    }),

    getAllProperties: build.query<SystemPropertyDto[], void>({
      query: () => '/api/sysadmin/properties',
      providesTags: [{ type: 'Property', id: 'SYSTEM' }],
    }),

    activateProperty: build.mutation<void, string>({
      query: (propertyId) => ({
        url: `/api/sysadmin/properties/${propertyId}/activate`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Property', id: 'PENDING' },
        { type: 'Property', id: 'LIST' },
        { type: 'Property', id: 'SYSTEM' },
      ],
    }),

    deactivateProperty: build.mutation<void, string>({
      query: (propertyId) => ({
        url: `/api/sysadmin/properties/${propertyId}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Property', id: 'PENDING' },
        { type: 'Property', id: 'LIST' },
        { type: 'Property', id: 'SYSTEM' },
      ],
    }),

    getAllInvites: build.query<SystemInviteDto[], SystemInviteStatus>({
      query: (status) => `/api/sysadmin/invites?status=${status}`,
      providesTags: [{ type: 'PendingInvite', id: 'SYSTEM' }],
    }),

    getAuditLogs: build.query<PagedAuditLogsResult, { entityType?: string; action?: string; page: number; pageSize?: number }>({
      query: ({ entityType, action, page, pageSize = 25 }) => {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
        if (entityType) params.set('entityType', entityType)
        if (action) params.set('action', action)
        return `/api/sysadmin/audit-logs?${params}`
      },
    }),

    sendTestEmail: build.mutation<void, { toEmail: string; template: number }>({
      query: (body) => ({
        url: '/api/sysadmin/test-email',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetAllUsersQuery,
  useGetUserWithMembershipsQuery,
  useAssignUserToPropertyMutation,
  useDeleteUserMutation,
  useGetPendingPropertiesQuery,
  useGetAllPropertiesQuery,
  useActivatePropertyMutation,
  useDeactivatePropertyMutation,
  useGetAllInvitesQuery,
  useGetAuditLogsQuery,
  useSendTestEmailMutation,
} = sysAdminApi
