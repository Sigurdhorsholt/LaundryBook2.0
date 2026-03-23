using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Email;

/// <summary>
/// No-op email service for local development (when SendGrid is not configured).
/// Logs the password-setup link to the console instead of sending an email.
/// </summary>
public class DevEmailService(ILogger<DevEmailService> logger) : IEmailService
{
    public Task SendPasswordSetupEmailAsync(string toEmail, string passwordSetupLink, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[DEV] Password setup email for {Email}: {Link}", toEmail, passwordSetupLink);
        return Task.CompletedTask;
    }
}
