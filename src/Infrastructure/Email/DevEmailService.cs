using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Email;

/// <summary>
/// No-op email service for local development (when SendGrid is not configured).
/// Logs the password-setup link to the console instead of sending an email.
/// </summary>
public class DevEmailService(ILogger<DevEmailService> logger) : IEmailService
{
    public Task SendPasswordSetupEmailAsync(
        string toEmail,
        string passwordSetupLink,
        string propertyName,
        string propertyAddress,
        string adminName,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[DEV] Invite email for {Email} | Property: {Property} ({Address}) | Sent by: {Admin} | Link: {Link}",
            toEmail, propertyName, propertyAddress, adminName, passwordSetupLink);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[DEV] Password reset email for {Email}: {Link}", toEmail, resetLink);
        return Task.CompletedTask;
    }
}
