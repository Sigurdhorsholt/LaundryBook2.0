using Application.Common.Interfaces;
using FirebaseAdmin.Auth;

namespace Infrastructure.Auth;

/// <summary>
/// Verifies a Firebase ID token using the Firebase Admin SDK.
/// Registered when Firebase:ProjectId is present in configuration.
/// </summary>
public class FirebaseIdentityProvider : IIdentityProvider
{
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
