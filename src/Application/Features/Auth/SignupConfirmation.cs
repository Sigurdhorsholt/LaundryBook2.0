using Application.Common.Interfaces;
using Domain.Common;
using Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Features.Auth;

// E-handelsloven § 12: a signup is confirmed electronically, without undue delay. Sent after the save:
// the account exists either way, so a failed send is logged rather than failing the signup.
internal static class SignupConfirmation
{
    public static async Task SendAsync(
        IEmailService emailService, ILogger logger, User user, string propertyName, bool createdAssociation, CancellationToken cancellationToken)
    {
        try
        {
            await emailService.SendSignupConfirmationEmailAsync(
                user.Email, user.FirstName, propertyName, createdAssociation, TermsPolicy.CurrentVersion, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Signup confirmation for user {UserId} could not be sent", user.Id);
        }
    }
}
