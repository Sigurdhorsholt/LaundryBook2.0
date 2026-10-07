using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Common;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands;

// Shared by RedeemInviteCommand (new/anonymous user) and AcceptInviteCommand (already logged in).
internal static class InviteRedemption
{
    public static async Task<UserInvite> FindRedeemableAsync(IAppDbContext db, string token, CancellationToken cancellationToken) =>
        await db.UserInvites
            .FirstOrDefaultAsync(i => i.Token == token && !i.IsUsed && i.ExpiresAt > DateTime.UtcNow, cancellationToken)
        ?? throw new NotFoundException("UserInvite", token);

    // Email-targeted invites may only be redeemed by the address they were issued to.
    // (Multi-use / QR invites carry no email and stay open by design.)
    public static void EnsureEmailMatches(UserInvite invite, string email)
    {
        if (!string.IsNullOrEmpty(invite.Email) &&
            !string.Equals(invite.Email, email, StringComparison.OrdinalIgnoreCase))
            throw new ForbiddenException("Invitationen er sendt til en anden e-mailadresse.", ErrorCodes.InviteEmailMismatch);
    }

    public static async Task ApplyAsync(
        IAppDbContext db, UserInvite invite, User user, string? apartmentNumber, CancellationToken cancellationToken)
    {
        user.TermsAcceptedAt = DateTime.UtcNow;
        user.TermsVersion = TermsPolicy.CurrentVersion;

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
                ApartmentNumber = apartmentNumber ?? invite.ApartmentNumber,
            });
        }

        // Multi-use tokens (printed QR) are never consumed
        if (!invite.IsMultiUse)
            invite.IsUsed = true;
    }
}
