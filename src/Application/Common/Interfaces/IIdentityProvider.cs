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
}

public record ExternalAuthResult(string ExternalId, string Email);
