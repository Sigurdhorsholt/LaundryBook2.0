namespace Application.Common.Interfaces;

public interface IEmailService
{
    Task SendPasswordSetupEmailAsync(string toEmail, string passwordSetupLink, CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default);
}
