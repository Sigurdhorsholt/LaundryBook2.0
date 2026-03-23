using Application.Features.Auth.Commands;
using Application.Features.Auth.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new LoginCommand(request.IdToken), ct);

        Response.Cookies.Append("access_token", result.JwtToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,   // false in HTTP dev, true in HTTPS prod
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(8),
        });

        return Ok(new { result.UserId });
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

    [HttpGet("invite-info")]
    public async Task<IActionResult> GetInviteInfo([FromQuery] string token, CancellationToken ct)
    {
        var info = await mediator.Send(new GetInviteInfoQuery(token), ct);
        return Ok(info);
    }

    [HttpPost("redeem-invite")]
    public async Task<IActionResult> RedeemInvite([FromBody] RedeemInviteRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(
            new RedeemInviteCommand(request.IdToken, request.InviteToken, request.ApartmentNumber), ct);

        Response.Cookies.Append("access_token", result.JwtToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(8),
        });

        return Ok(new { result.UserId });
    }
}

public record LoginRequest(string IdToken);
public record RedeemInviteRequest(string IdToken, string InviteToken, string? ApartmentNumber);
