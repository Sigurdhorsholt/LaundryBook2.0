using Application.Features.Properties.Commands;
using Application.Features.Properties.Queries;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/properties")]
public class PropertiesController(IMediator mediator, IConfiguration configuration) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMyProperties(CancellationToken ct)
    {
        var result = await mediator.Send(new GetMyPropertiesQuery(), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProperty(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetPropertyQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyCommand command, CancellationToken ct)
    {
        var id = await mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetProperty), new { id }, new { id });
    }

    [HttpPut("{id:guid}/settings")]
    public async Task<IActionResult> UpdateSettings(Guid id, [FromBody] UpdateSettingsRequest request, CancellationToken ct)
    {
        await mediator.Send(new UpdateComplexSettingsCommand(
            id,
            request.BookingMode,
            request.CancellationWindowMinutes,
            request.MaxConcurrentBookingsPerUser), ct);

        return NoContent();
    }

    [HttpGet("{id:guid}/members")]
    public async Task<IActionResult> GetMembers(Guid id, CancellationToken ct)
    {
        var members = await mediator.Send(new GetPropertyMembersQuery(id), ct);
        return Ok(members);
    }

    [HttpPost("{id:guid}/members")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddMemberRequest request, CancellationToken ct)
    {
        var userId = await mediator.Send(new AddMemberCommand(
            id,
            request.Email,
            request.Role,
            request.ApartmentNumber), ct);

        return Ok(new { userId });
    }

    [HttpPut("{id:guid}/members/{userId:guid}")]
    public async Task<IActionResult> UpdateMember(Guid id, Guid userId, [FromBody] UpdateMemberRequest request, CancellationToken ct)
    {
        await mediator.Send(new UpdateMemberCommand(id, userId, request.ApartmentNumber, request.Role, request.IsActive), ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid userId, CancellationToken ct)
    {
        await mediator.Send(new RemoveMemberCommand(id, userId), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/members/{userId:guid}/force-password-reset")]
    public async Task<IActionResult> ForcePasswordReset(Guid id, Guid userId, CancellationToken ct)
    {
        await mediator.Send(new ForcePasswordResetCommand(id, userId), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/members/invite")]
    public async Task<IActionResult> InviteByEmail(Guid id, [FromBody] InviteByEmailRequest request, CancellationToken ct)
    {
        var appBaseUrl = configuration["App:BaseUrl"] ?? "https://app.laundrybook.com";
        var email = await mediator.Send(new InviteUserByEmailCommand(
            id,
            request.Email,
            request.Role,
            request.ApartmentNumber,
            appBaseUrl), ct);

        return Ok(new { email });
    }

    [HttpGet("{id:guid}/members/pending")]
    public async Task<IActionResult> GetPendingInvites(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetPendingInvitesQuery(id), ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/members/pending/{inviteId:guid}/resend")]
    public async Task<IActionResult> ResendInvite(Guid id, Guid inviteId, CancellationToken ct)
    {
        var appBaseUrl = configuration["App:BaseUrl"] ?? "https://app.laundrybook.com";
        await mediator.Send(new ResendInviteCommand(id, inviteId, appBaseUrl), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/members/invite-token")]
    public async Task<IActionResult> CreateInviteToken(Guid id, [FromBody] CreateInviteTokenRequest request, CancellationToken ct)
    {
        var token = await mediator.Send(new CreateInviteTokenCommand(
            id,
            request.Role,
            request.ApartmentNumber,
            request.IsMultiUse), ct);

        return Ok(new { token });
    }
}

public record UpdateSettingsRequest(
    BookingMode BookingMode,
    int CancellationWindowMinutes,
    int MaxConcurrentBookingsPerUser);

public record AddMemberRequest(
    string Email,
    UserRole Role,
    string? ApartmentNumber);

public record InviteByEmailRequest(
    string Email,
    UserRole Role,
    string? ApartmentNumber);

public record UpdateMemberRequest(
    string? ApartmentNumber,
    UserRole Role,
    bool IsActive);

public record CreateInviteTokenRequest(
    UserRole Role,
    string? ApartmentNumber,
    bool IsMultiUse = false);
