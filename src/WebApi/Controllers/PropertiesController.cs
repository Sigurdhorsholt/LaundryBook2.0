using Application.Features.Properties.Commands;
using Application.Features.Properties.Queries;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/properties")]
public class PropertiesController(IMediator mediator) : ControllerBase
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

    [HttpDelete("{id:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid userId, CancellationToken ct)
    {
        await mediator.Send(new RemoveMemberCommand(id, userId), ct);
        return NoContent();
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
