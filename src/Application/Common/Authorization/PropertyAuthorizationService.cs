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

        // SysAdmin: global access via a SysAdmin membership on any property,
        // or we can check a dedicated flag. For now: check if the user has SysAdmin on ANY property.
        var isSysAdmin = await db.UserComplexMemberships
            .AnyAsync(m => m.UserId == userId && m.Role == UserRole.SysAdmin, ct);

        if (isSysAdmin) return;

        var membership = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == userId && m.PropertyId == propertyId, ct);

        if (membership is null || membership.Role < minimumRole)
            throw new ForbiddenException();
    }

    /// <summary>Returns true if the current user is a SysAdmin.</summary>
    public async Task<bool> IsSysAdminAsync(CancellationToken ct = default)
    {
        var userId = currentUser.UserId;
        if (userId is null) return false;

        return await db.UserComplexMemberships
            .AnyAsync(m => m.UserId == userId && m.Role == UserRole.SysAdmin, ct);
    }
}
