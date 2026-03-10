using Application.Features.LaundryMachines.Commands;
using Application.Features.LaundryMachines.Queries;
using Application.Features.LaundryRooms.Commands;
using Application.Features.LaundryRooms.Queries;
using Application.Features.TimeSlotTemplates.Commands;
using Application.Features.TimeSlotTemplates.Queries;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize]
[ApiController]
public class LaundryRoomsController(IMediator mediator) : ControllerBase
{
    // ── Rooms ─────────────────────────────────────────────────────────────────

    [HttpGet("api/properties/{propertyId:guid}/laundry-rooms")]
    public async Task<IActionResult> GetLaundryRooms(Guid propertyId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetLaundryRoomsQuery(propertyId), ct);
        return Ok(result);
    }

    [HttpPost("api/properties/{propertyId:guid}/laundry-rooms")]
    public async Task<IActionResult> CreateLaundryRoom(Guid propertyId, [FromBody] CreateLaundryRoomRequest request, CancellationToken ct)
    {
        var id = await mediator.Send(new CreateLaundryRoomCommand(propertyId, request.Name, request.Description), ct);
        return Ok(new { id });
    }

    [HttpPut("api/laundry-rooms/{roomId:guid}")]
    public async Task<IActionResult> UpdateLaundryRoom(Guid roomId, [FromBody] UpdateLaundryRoomRequest request, CancellationToken ct)
    {
        await mediator.Send(new UpdateLaundryRoomCommand(roomId, request.Name, request.Description), ct);
        return NoContent();
    }

    [HttpDelete("api/laundry-rooms/{roomId:guid}")]
    public async Task<IActionResult> DeactivateLaundryRoom(Guid roomId, CancellationToken ct)
    {
        await mediator.Send(new DeactivateLaundryRoomCommand(roomId), ct);
        return NoContent();
    }

    // ── Machines ──────────────────────────────────────────────────────────────

    [HttpGet("api/laundry-rooms/{roomId:guid}/machines")]
    public async Task<IActionResult> GetMachines(Guid roomId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetLaundryMachinesQuery(roomId), ct);
        return Ok(result);
    }

    [HttpPost("api/laundry-rooms/{roomId:guid}/machines")]
    public async Task<IActionResult> CreateMachine(Guid roomId, [FromBody] CreateMachineRequest request, CancellationToken ct)
    {
        var id = await mediator.Send(new CreateLaundryMachineCommand(roomId, request.Name, request.MachineType), ct);
        return Ok(new { id });
    }

    [HttpPut("api/laundry-rooms/{roomId:guid}/machines/{machineId:guid}")]
    public async Task<IActionResult> UpdateMachine(Guid roomId, Guid machineId, [FromBody] UpdateMachineRequest request, CancellationToken ct)
    {
        await mediator.Send(new UpdateLaundryMachineCommand(roomId, machineId, request.Name, request.MachineType), ct);
        return NoContent();
    }

    [HttpDelete("api/laundry-rooms/{roomId:guid}/machines/{machineId:guid}")]
    public async Task<IActionResult> DeactivateMachine(Guid roomId, Guid machineId, CancellationToken ct)
    {
        await mediator.Send(new DeactivateLaundryMachineCommand(roomId, machineId), ct);
        return NoContent();
    }

    // ── Time slot templates ───────────────────────────────────────────────────

    [HttpGet("api/laundry-rooms/{roomId:guid}/timeslots")]
    public async Task<IActionResult> GetTimeSlots(Guid roomId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetTimeSlotTemplatesQuery(roomId), ct);
        return Ok(result);
    }

    [HttpPost("api/laundry-rooms/{roomId:guid}/timeslots")]
    public async Task<IActionResult> CreateTimeSlot(Guid roomId, [FromBody] CreateTimeSlotRequest request, CancellationToken ct)
    {
        var id = await mediator.Send(new CreateTimeSlotTemplateCommand(roomId, request.StartTime, request.EndTime), ct);
        return Ok(new { id });
    }

    [HttpDelete("api/laundry-rooms/{roomId:guid}/timeslots/{templateId:guid}")]
    public async Task<IActionResult> DeactivateTimeSlot(Guid roomId, Guid templateId, CancellationToken ct)
    {
        await mediator.Send(new DeactivateTimeSlotTemplateCommand(roomId, templateId), ct);
        return NoContent();
    }
}

public record CreateLaundryRoomRequest(string Name, string? Description);
public record UpdateLaundryRoomRequest(string Name, string? Description);
public record CreateMachineRequest(string Name, MachineType MachineType);
public record UpdateMachineRequest(string Name, MachineType MachineType);
public record CreateTimeSlotRequest(TimeOnly StartTime, TimeOnly EndTime);
