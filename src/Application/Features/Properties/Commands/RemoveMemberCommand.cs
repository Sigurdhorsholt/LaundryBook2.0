using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record RemoveMemberCommand(Guid PropertyId, Guid UserId) : IRequest;

public class RemoveMemberCommandHandler(
    IAppDbContext db,
    ICurrentUserService currentUser,
    IIdentityProvider identityProvider,
    PropertyAuthorizationService auth) : IRequestHandler<RemoveMemberCommand>
{
    public async Task Handle(RemoveMemberCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        if (request.UserId == currentUser.UserId)
            throw new InvalidOperationException("You cannot remove yourself from the property.");

        var membership = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == request.UserId && m.PropertyId == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException("Membership", $"{request.UserId} in property {request.PropertyId}");

        db.UserComplexMemberships.Remove(membership);
        await db.SaveChangesAsync(cancellationToken);

        // Cascade: if the user has no remaining memberships, delete the user record and Firebase account
        var remainingMemberships = await db.UserComplexMemberships
            .CountAsync(m => m.UserId == request.UserId, cancellationToken);

        if (remainingMemberships == 0)
        {
            var user = await db.Users.FindAsync([request.UserId], cancellationToken);
            if (user is not null)
            {
                db.Users.Remove(user);
                await db.SaveChangesAsync(cancellationToken);
                await identityProvider.DeleteUserAsync(user.ExternalId, cancellationToken);
            }
        }
    }
}
