using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth;

// Deleting an account, from Min side (GDPR art. 17) or by a SysAdmin on /system, with the same rules.
// Memberships and bookings go with the user row via the database cascade, which also frees the user's
// future booking slots.
public class AccountDeletion(
    IAppDbContext db,
    IIdentityProvider identityProvider,
    PropertyAuthorizationService auth)
{
    public async Task DeleteAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .Include(u => u.Memberships)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), userId);

        // An association can't be left without an administrator; someone else has to take over first
        foreach (var membership in user.Memberships.Where(m => m.IsActive && m.Role >= UserRole.ComplexAdmin))
            await auth.RequireNotLastAdminAsync(membership.PropertyId, userId, cancellationToken);

        // Firebase first: if it fails nothing is deleted and it can be retried. The other order would
        // leave a Firebase login that silently re-creates an empty user on the next sign-in.
        await identityProvider.DeleteUserAsync(user.ExternalId, cancellationToken);

        db.Users.Remove(user);
        await db.SaveChangesAsync(cancellationToken);
    }
}
