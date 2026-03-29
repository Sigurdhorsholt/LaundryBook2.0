namespace Application.Common.Interfaces;

public interface IEmailService
{
    Task SendPasswordSetupEmailAsync(
        string toEmail,
        string passwordSetupLink,
        string propertyName,
        string propertyAddress,
        string adminName,
        CancellationToken cancellationToken = default);

    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default);
}
