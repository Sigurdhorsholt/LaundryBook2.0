using Application.Features.Auth.Commands;
using Application.Features.Auth.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IMediator mediator, IWebHostEnvironment env) : ControllerBase
{
    // SameSite=None is required when the frontend and API are on different domains (prod).
    // SameSite=Lax is fine for local dev where both run on localhost.
    private CookieOptions AuthCookieOptions() => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
        Expires = DateTimeOffset.UtcNow.AddHours(8),
    };

    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new LoginCommand(request.IdToken), ct);

        Response.Cookies.Append("access_token", result.JwtToken, AuthCookieOptions());

        return Ok(new { result.UserId });
    }

    [EnableRateLimiting("auth")]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(
            new RegisterCommand(request.IdToken, request.FirstName, request.LastName, request.PropertyName, request.PropertyAddress, request.AcceptedTerms), ct);

        Response.Cookies.Append("access_token", result.JwtToken, AuthCookieOptions());

        return Ok(new { result.UserId, result.PropertyId });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token");
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var user = await mediator.Send(new GetCurrentUserQuery(), ct);
        return Ok(user);
    }

    [EnableRateLimiting("auth")]
    [HttpGet("invite-info")]
    public async Task<IActionResult> GetInviteInfo([FromQuery] string token, CancellationToken ct)
    {
        var info = await mediator.Send(new GetInviteInfoQuery(token), ct);
        return Ok(info);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateMeRequest request, CancellationToken ct)
    {
        await mediator.Send(new UpdateCurrentUserCommand(request.FirstName, request.LastName), ct);
        return NoContent();
    }

    [EnableRateLimiting("email")]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        await mediator.Send(new ForgotPasswordCommand(request.Email), ct);
        return NoContent();
    }

    [EnableRateLimiting("auth")]
    [HttpPost("redeem-invite")]
    public async Task<IActionResult> RedeemInvite([FromBody] RedeemInviteRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(
            new RedeemInviteCommand(request.IdToken, request.InviteToken, request.ApartmentNumber, request.FirstName, request.LastName, request.AcceptedTerms), ct);

        Response.Cookies.Append("access_token", result.JwtToken, AuthCookieOptions());

        return Ok(new { result.UserId });
    }
}

public record LoginRequest(string IdToken);
public record RegisterRequest(string IdToken, string FirstName, string LastName, string PropertyName, string PropertyAddress, bool AcceptedTerms);
public record UpdateMeRequest(string FirstName, string LastName);
public record ForgotPasswordRequest(string Email);
public record RedeemInviteRequest(string IdToken, string InviteToken, string? ApartmentNumber, string FirstName, string LastName, bool AcceptedTerms);
