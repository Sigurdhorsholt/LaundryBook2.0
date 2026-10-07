using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands;

public record DeleteMyAccountCommand : IRequest;

// The "delete my account" right (GDPR art. 17). Memberships and bookings go with the user row via the
// database cascade, which also frees the user's future booking slots.
public class DeleteMyAccountCommandHandler(
    IAppDbContext db,
    ICurrentUserService currentUser,
    IIdentityProvider identityProvider,
    PropertyAuthorizationService auth) : IRequestHandler<DeleteMyAccountCommand>
{
    public async Task Handle(DeleteMyAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new ForbiddenException("Du skal være logget ind.", ErrorCodes.NotSignedIn);

        var user = await db.Users
            .Include(u => u.Memberships)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), userId);

        // An association can't be left without an administrator; the board hands over first
        foreach (var membership in user.Memberships.Where(m => m.IsActive && m.Role >= UserRole.ComplexAdmin))
            await auth.RequireNotLastAdminAsync(membership.PropertyId, userId, cancellationToken);

        // Firebase first: if it fails nothing is deleted and the user can retry. The other order would
        // leave a Firebase login that silently re-creates an empty user on the next sign-in.
        await identityProvider.DeleteUserAsync(user.ExternalId, cancellationToken);

        db.Users.Remove(user);
        await db.SaveChangesAsync(cancellationToken);
    }
}
