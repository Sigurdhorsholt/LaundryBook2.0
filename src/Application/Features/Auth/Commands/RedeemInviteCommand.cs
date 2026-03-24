using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands;

public record RedeemInviteCommand(
    string IdToken,
    string InviteToken,
    string? ApartmentNumber,
    string FirstName,
    string LastName) : IRequest<RedeemInviteResult>;

public record RedeemInviteResult(string JwtToken, Guid UserId);

public class RedeemInviteCommandHandler(
    IAppDbContext db,
    IIdentityProvider identityProvider,
    IJwtService jwtService) : IRequestHandler<RedeemInviteCommand, RedeemInviteResult>
{
    public async Task<RedeemInviteResult> Handle(RedeemInviteCommand request, CancellationToken cancellationToken)
    {
        var external = await identityProvider.VerifyTokenAsync(request.IdToken, cancellationToken);

        var invite = await db.UserInvites
            .FirstOrDefaultAsync(
                i => i.Token == request.InviteToken && !i.IsUsed && i.ExpiresAt > DateTime.UtcNow,
                cancellationToken)
            ?? throw new NotFoundException("UserInvite", request.InviteToken);

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.ExternalId == external.ExternalId, cancellationToken);

        if (user is null)
        {
            user = new User
            {
                ExternalId = external.ExternalId,
                Email = external.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
            };
            db.Users.Add(user);
        }
        else
        {
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
        }

        var membershipExists = await db.UserComplexMemberships
            .AnyAsync(m => m.UserId == user.Id && m.PropertyId == invite.PropertyId, cancellationToken);

        if (!membershipExists)
        {
            db.UserComplexMemberships.Add(new UserComplexMembership
            {
                UserId = user.Id,
                PropertyId = invite.PropertyId,
                Role = invite.Role,
                // User-supplied apartment takes precedence; fall back to invite's pre-assigned value
                ApartmentNumber = request.ApartmentNumber ?? invite.ApartmentNumber,
            });
        }

        // Multi-use tokens (printed QR) are never consumed
        if (!invite.IsMultiUse)
            invite.IsUsed = true;

        await db.SaveChangesAsync(cancellationToken);

        var token = jwtService.GenerateToken(user);
        return new RedeemInviteResult(token, user.Id);
    }
}
