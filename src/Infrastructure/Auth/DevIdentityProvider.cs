using Application.Common.Interfaces;
using System.Text.Json;

namespace Infrastructure.Auth;

/// <summary>
/// MVP/dev-only IDP. Accepts a JSON payload: {"externalId":"...","email":"..."}
/// Replace with FirebaseIdentityProvider (or other) when integrating a real IDP.
/// Only register this in Development — see DependencyInjection.cs.
/// </summary>
public class DevIdentityProvider : IIdentityProvider
{
    public Task<ExternalAuthResult> VerifyTokenAsync(string idToken, CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = JsonSerializer.Deserialize<DevTokenPayload>(idToken,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (payload is null || string.IsNullOrEmpty(payload.ExternalId) || string.IsNullOrEmpty(payload.Email))
                throw new InvalidOperationException("Invalid dev token payload.");

            return Task.FromResult(new ExternalAuthResult(payload.ExternalId, payload.Email));
        }
        catch (JsonException)
        {
            throw new InvalidOperationException("Dev token must be JSON: {\"externalId\":\"...\",\"email\":\"...\"}");
        }
    }

    private record DevTokenPayload(string ExternalId, string Email);
}
