namespace Application.Common.Interfaces;

/// <summary>
/// Abstracts the external Identity Provider (IDP).
/// Swap the implementation to change from dev/mock → Firebase → Auth0 etc.
/// </summary>
public interface IIdentityProvider
{
    /// <summary>
    /// Verifies an IDP token and returns the external identity.
    /// For Firebase this is a Firebase ID token.
    /// For the dev provider this is a JSON payload: {"externalId":"...","email":"..."}.
    /// </summary>
    Task<ExternalAuthResult> VerifyTokenAsync(string idToken, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new IDP account for the given email (no password — user sets it via password reset).
    /// Returns the ExternalId (e.g. Firebase UID) of the created account.
    /// </summary>
    Task<string> CreateUserAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a one-time password-reset / password-setup link for the given email.
    /// </summary>
    Task<string> GeneratePasswordResetLinkAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Permanently deletes the IDP account for the given external ID.
    /// </summary>
    Task DeleteUserAsync(string externalId, CancellationToken cancellationToken = default);
}

public record ExternalAuthResult(string ExternalId, string Email);
