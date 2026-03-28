using Application.Features.SysAdmin.Commands;
using Application.Features.SysAdmin.Queries;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/sysadmin")]
public class SysAdminController(IMediator mediator) : ControllerBase
{
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

    [HttpPost("users/{userId:guid}/memberships")]
    public async Task<IActionResult> AssignToProperty(Guid userId, [FromBody] AssignToPropertyRequest request, CancellationToken ct)
    {
        await mediator.Send(new AssignUserToPropertyCommand(userId, request.PropertyId, request.Role, request.ApartmentNumber), ct);
        return NoContent();
    }
}

public record AssignToPropertyRequest(Guid PropertyId, UserRole Role, string? ApartmentNumber);
