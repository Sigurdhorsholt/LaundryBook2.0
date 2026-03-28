using Application.Features.Bookings.Commands;
using Application.Features.Bookings.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[Authorize]
[ApiController]
public class BookingsController(IMediator mediator) : ControllerBase
{
    // GET /api/laundry-rooms/{roomId}/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD
    [HttpGet("api/laundry-rooms/{roomId:guid}/bookings")]
    public async Task<IActionResult> GetBookings(
        Guid roomId,
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetBookingsQuery(roomId, from, to), ct);
        return Ok(result);
    }

    // GET /api/properties/{propertyId}/bookings/mine
    [HttpGet("api/properties/{propertyId:guid}/bookings/mine")]
    public async Task<IActionResult> GetMyBookings(Guid propertyId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetMyBookingsQuery(propertyId), ct);
        return Ok(result);
    }

    // POST /api/laundry-rooms/{roomId}/bookings
    [HttpPost("api/laundry-rooms/{roomId:guid}/bookings")]
    public async Task<IActionResult> CreateBooking(
        Guid roomId,
        [FromBody] CreateBookingRequest request,
        CancellationToken ct)
    {
        var id = await mediator.Send(new CreateBookingCommand(roomId, request.TimeSlotTemplateId, request.Date), ct);
        return Ok(new { id });
    }

    // DELETE /api/bookings/{bookingId}
    [HttpDelete("api/bookings/{bookingId:guid}")]
    public async Task<IActionResult> CancelBooking(Guid bookingId, CancellationToken ct)
    {
        await mediator.Send(new CancelBookingCommand(bookingId), ct);
        return NoContent();
    }
}

public record CreateBookingRequest(Guid TimeSlotTemplateId, DateOnly Date);
