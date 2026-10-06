using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties;

// A property's shared ("mass") invite link / printed QR code: a multi-use invite anyone can redeem.
// Revoking expires it immediately, so every redemption path (which all require ExpiresAt > now)
// rejects it without a separate revoked flag or migration.
internal static class OpenInviteLinks
{
    public static IQueryable<UserInvite> Active(IAppDbContext db, Guid propertyId)
    {
        var now = DateTime.UtcNow;
        return db.UserInvites.Where(i => i.PropertyId == propertyId && i.IsMultiUse && i.ExpiresAt > now);
    }

    public static async Task<int> RevokeAsync(IAppDbContext db, Guid propertyId, CancellationToken cancellationToken)
    {
        var active = await Active(db, propertyId).ToListAsync(cancellationToken);
        var now = DateTime.UtcNow;
        foreach (var invite in active)
        {
            invite.ExpiresAt = now;
            invite.UpdatedAt = now;
        }
        return active.Count;
    }
}
