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

    /// <summary>Sent when an admin forces a password reset for an existing user (distinct from an invite or a user-initiated reset).</summary>
    Task SendAdminPasswordResetEmailAsync(
        string toEmail,
        string resetLink,
        string propertyName,
        string adminName,
        CancellationToken cancellationToken = default);
}
