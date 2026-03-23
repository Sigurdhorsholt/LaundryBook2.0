using Application.Common.Interfaces;
using FirebaseAdmin.Auth;

namespace Infrastructure.Auth;

/// <summary>
/// Verifies a Firebase ID token using the Firebase Admin SDK.
/// Registered when Firebase:ProjectId is present in configuration.
/// </summary>
public class FirebaseIdentityProvider : IIdentityProvider
{
    public async Task<string> CreateUserAsync(string email, CancellationToken cancellationToken = default)
    {
        var args = new UserRecordArgs { Email = email };
        var record = await FirebaseAuth.DefaultInstance.CreateUserAsync(args, cancellationToken);
        return record.Uid;
    }

    public async Task<string> GeneratePasswordResetLinkAsync(string email, CancellationToken cancellationToken = default)
        => await FirebaseAuth.DefaultInstance.GeneratePasswordResetLinkAsync(email, null, cancellationToken);

    public async Task DeleteUserAsync(string externalId, CancellationToken cancellationToken = default)
        => await FirebaseAuth.DefaultInstance.DeleteUserAsync(externalId, cancellationToken);

    public async Task<ExternalAuthResult> VerifyTokenAsync(string idToken, CancellationToken cancellationToken = default)
    {
        FirebaseToken decoded;
        try
        {
            decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken, cancellationToken);
        }
        catch (FirebaseAuthException ex)
        {
            throw new InvalidOperationException($"Firebase token verification failed: {ex.Message}", ex);
        }

        var email = decoded.Claims.TryGetValue("email", out var emailObj)
            ? emailObj?.ToString()
            : null;

        if (string.IsNullOrEmpty(email))
            throw new InvalidOperationException("Firebase token is missing the email claim.");

        return new ExternalAuthResult(decoded.Uid, email);
    }
}
