using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Common;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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

    // Call after saving, so the email never confirms a signup that didn't happen
    public static async Task ConfirmAsync(
        IAppDbContext db, IEmailService emailService, ILogger logger, UserInvite invite, User user, CancellationToken cancellationToken)
    {
        var propertyName = await db.Properties
            .Where(p => p.Id == invite.PropertyId)
            .Select(p => p.Name)
            .FirstAsync(cancellationToken);
        await SignupConfirmation.SendAsync(emailService, logger, user, propertyName, createdAssociation: false, cancellationToken);
    }
}
