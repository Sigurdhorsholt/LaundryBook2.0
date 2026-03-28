import { baseApi } from '../../app/baseApi'
import { UserRole } from '../auth/authApi'

export interface PropertyMemberDto {
  userId: string
  email: string
  firstName: string
  lastName: string
  apartmentNumber: string | null
  role: UserRole
  isActive: boolean
  joinedAt: string
}

export interface InviteByEmailRequest {
  email: string
  role: UserRole
  apartmentNumber: string | null
}

export interface CreateInviteTokenRequest {
  role: UserRole
  apartmentNumber: string | null
  isMultiUse?: boolean
}

export interface PendingInviteDto {
  inviteId: string
  email: string
  role: UserRole
  apartmentNumber: string | null
  expiresAt: string
}

export interface UpdateMemberRequest {
  apartmentNumber: string | null
  role: UserRole
  isActive: boolean
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPropertyMembers: builder.query<PropertyMemberDto[], string>({
      query: (propertyId) => `/api/properties/${propertyId}/members`,
      providesTags: (_result, _err, propertyId) => [{ type: 'Auth', id: `members-${propertyId}` }],
    }),

    inviteByEmail: builder.mutation<{ email: string }, { propertyId: string } & InviteByEmailRequest>({
      query: ({ propertyId, ...body }) => ({
        url: `/api/properties/${propertyId}/members/invite`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { propertyId }) => [{ type: 'Auth', id: `members-${propertyId}` }],
    }),

    updateMember: builder.mutation<void, { propertyId: string; userId: string } & UpdateMemberRequest>({
      query: ({ propertyId, userId, ...body }) => ({
        url: `/api/properties/${propertyId}/members/${userId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { propertyId, userId }) => [
        { type: 'Auth', id: `members-${propertyId}` },
        { type: 'User', id: userId },
      ],
    }),

    removeMember: builder.mutation<void, { propertyId: string; userId: string }>({
      query: ({ propertyId, userId }) => ({
        url: `/api/properties/${propertyId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { propertyId, userId }) => [
        { type: 'Auth', id: `members-${propertyId}` },
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    forcePasswordReset: builder.mutation<void, { propertyId: string; userId: string }>({
      query: ({ propertyId, userId }) => ({
        url: `/api/properties/${propertyId}/members/${userId}/force-password-reset`,
        method: 'POST',
      }),
    }),

    createInviteToken: builder.mutation<{ token: string }, { propertyId: string } & CreateInviteTokenRequest>({
      query: ({ propertyId, ...body }) => ({
        url: `/api/properties/${propertyId}/members/invite-token`,
        method: 'POST',
        body,
      }),
    }),

    getPendingInvites: builder.query<PendingInviteDto[], string>({
      query: (propertyId) => `/api/properties/${propertyId}/members/pending`,
      providesTags: (_result, _err, propertyId) => [{ type: 'Auth', id: `pending-${propertyId}` }],
    }),

    resendInvite: builder.mutation<void, { propertyId: string; inviteId: string }>({
      query: ({ propertyId, inviteId }) => ({
        url: `/api/properties/${propertyId}/members/pending/${inviteId}/resend`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, { propertyId }) => [{ type: 'Auth', id: `pending-${propertyId}` }],
    }),
  }),
})

export const {
  useGetPropertyMembersQuery,
  useInviteByEmailMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useForcePasswordResetMutation,
  useCreateInviteTokenMutation,
  useGetPendingInvitesQuery,
  useResendInviteMutation,
} = usersApi
