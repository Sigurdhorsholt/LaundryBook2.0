using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Authorization;

/// <summary>
/// Centralises role checks for property-scoped operations.
/// </summary>
public class PropertyAuthorizationService(IAppDbContext db, ICurrentUserService currentUser)
{
    /// <summary>
    /// Throws ForbiddenException if the current user does not have at least the required role
    /// for the given property. SysAdmin always passes.
    /// </summary>
    public async Task RequireRoleAsync(
        Guid propertyId,
        UserRole minimumRole,
        CancellationToken ct = default)
    {
        var userId = currentUser.UserId
            ?? throw new ForbiddenException();

        // SysAdmin: global access via an active SysAdmin membership on any property.
        var isSysAdmin = await db.UserComplexMemberships
            .AnyAsync(m => m.UserId == userId && m.Role == UserRole.SysAdmin && m.IsActive, ct);

        if (isSysAdmin) return;

        var membership = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == userId && m.PropertyId == propertyId && m.IsActive, ct);

        if (membership is null || membership.Role < minimumRole)
            throw new ForbiddenException();
    }

    /// <summary>Returns true if the current user is a SysAdmin.</summary>
    public async Task<bool> IsSysAdminAsync(CancellationToken ct = default)
    {
        var userId = currentUser.UserId;
        if (userId is null) return false;

        return await db.UserComplexMemberships
            .AnyAsync(m => m.UserId == userId && m.Role == UserRole.SysAdmin && m.IsActive, ct);
    }

    /// <summary>
    /// The current user's effective role for a property: SysAdmin if they are a SysAdmin anywhere,
    /// otherwise their active membership role on that property (null if they have none).
    /// </summary>
    public async Task<UserRole?> GetEffectiveRoleAsync(Guid propertyId, CancellationToken ct = default)
    {
        var userId = currentUser.UserId;
        if (userId is null) return null;

        if (await IsSysAdminAsync(ct)) return UserRole.SysAdmin;

        var membership = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == userId && m.PropertyId == propertyId && m.IsActive, ct);

        return membership?.Role;
    }

    /// <summary>
    /// Throws ForbiddenException if the current user tries to grant a role higher than their own.
    /// Prevents a ComplexAdmin from creating/promoting OrgAdmins above themselves.
    /// </summary>
    public async Task RequireCanGrantRoleAsync(Guid propertyId, UserRole roleToGrant, CancellationToken ct = default)
    {
        var effectiveRole = await GetEffectiveRoleAsync(propertyId, ct)
            ?? throw new ForbiddenException();

        if (roleToGrant > effectiveRole)
            throw new ForbiddenException("You cannot grant a role higher than your own.");
    }

    /// <summary>
    /// Throws ForbiddenException if the target member outranks the current user, so an admin cannot
    /// modify or remove a member (e.g. an OrgAdmin or a SysAdmin) with a higher role than their own.
    /// </summary>
    public async Task RequireCanManageMemberAsync(Guid propertyId, Guid targetUserId, CancellationToken ct = default)
    {
        var effectiveRole = await GetEffectiveRoleAsync(propertyId, ct)
            ?? throw new ForbiddenException();

        if (effectiveRole == UserRole.SysAdmin) return;

        var targetRole = await db.UserComplexMemberships
            .Where(m => m.UserId == targetUserId && m.PropertyId == propertyId)
            .Select(m => (UserRole?)m.Role)
            .FirstOrDefaultAsync(ct);

        if (targetRole > effectiveRole)
            throw new ForbiddenException("You cannot manage a member with a higher role than your own.");
    }

    /// <summary>
    /// Throws ConflictException if removing/demoting the given member would leave the property with
    /// no other active administrator.
    /// </summary>
    public async Task RequireNotLastAdminAsync(Guid propertyId, Guid affectedUserId, CancellationToken ct = default)
    {
        var otherActiveAdmins = await db.UserComplexMemberships
            .CountAsync(m => m.PropertyId == propertyId
                && m.UserId != affectedUserId
                && m.IsActive
                && m.Role >= UserRole.ComplexAdmin, ct);

        if (otherActiveAdmins == 0)
            throw new ConflictException("Foreningen skal have mindst én aktiv administrator.");
    }
}
