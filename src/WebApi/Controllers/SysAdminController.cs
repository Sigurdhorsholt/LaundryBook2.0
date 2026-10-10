using Application.Features.SysAdmin.Commands;
using Application.Features.SysAdmin.Queries;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/sysadmin")]
public class SysAdminController(IMediator mediator) : ControllerBase
{
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(CancellationToken ct)
    {
        var result = await mediator.Send(new GetSystemStatusQuery(), ct);
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetAllUsersQuery(search, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("users/{userId:guid}")]
    public async Task<IActionResult> GetUser(Guid userId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetUserWithMembershipsQuery(userId), ct);
        return Ok(result);
    }

    [HttpDelete("users/{userId:guid}")]
    public async Task<IActionResult> DeleteUser(Guid userId, CancellationToken ct)
    {
        await mediator.Send(new DeleteUserCommand(userId), ct);
        return NoContent();
    }

    [HttpPost("users/{userId:guid}/memberships")]
    public async Task<IActionResult> AssignToProperty(Guid userId, [FromBody] AssignToPropertyRequest request, CancellationToken ct)
    {
        await mediator.Send(new AssignUserToPropertyCommand(userId, request.PropertyId, request.Role, request.ApartmentNumber), ct);
        return NoContent();
    }

    [HttpGet("pending-properties")]
    public async Task<IActionResult> GetPendingProperties(CancellationToken ct)
    {
        var result = await mediator.Send(new GetPendingPropertiesQuery(), ct);
        return Ok(result);
    }

    [HttpGet("properties")]
    public async Task<IActionResult> GetAllProperties(CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllPropertiesQuery(), ct);
        return Ok(result);
    }

    [HttpPost("properties/{propertyId:guid}/activate")]
    public async Task<IActionResult> ActivateProperty(Guid propertyId, CancellationToken ct)
    {
        await mediator.Send(new ActivatePropertyCommand(propertyId), ct);
        return NoContent();
    }

    [HttpPost("properties/{propertyId:guid}/deactivate")]
    public async Task<IActionResult> DeactivateProperty(Guid propertyId, CancellationToken ct)
    {
        await mediator.Send(new DeactivatePropertyCommand(propertyId), ct);
        return NoContent();
    }

    [HttpGet("invites")]
    public async Task<IActionResult> GetAllInvites([FromQuery] SystemInviteStatus status = SystemInviteStatus.Pending, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetAllInvitesQuery(status), ct);
        return Ok(result);
    }

    [EnableRateLimiting("email")]
    [HttpPost("test-email")]
    public async Task<IActionResult> SendTestEmail([FromBody] SendTestEmailCommand command, CancellationToken ct)
    {
        await mediator.Send(command, ct);
        return NoContent();
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? entityType,
        [FromQuery] Guid? userId,
        [FromQuery] string? action,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(
            new GetAuditLogsQuery(entityType, userId, action, from, to, page, pageSize), ct);
        return Ok(result);
    }
}

public record AssignToPropertyRequest(Guid PropertyId, UserRole Role, string? ApartmentNumber);
