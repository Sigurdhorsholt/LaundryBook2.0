using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Bookings.Queries;

public record GetPropertyBookingsQuery(Guid PropertyId, DateOnly From, DateOnly To)
    : IRequest<PropertyBookingsDto>;

public record PropertyBookingsDto(
    List<AdminBookingDto> Bookings,
    List<AdminRoomSummaryDto> Rooms);

public record AdminBookingDto(
    Guid Id,
    Guid RoomId,
    string RoomName,
    Guid TimeSlotTemplateId,
    DateOnly Date,
    TimeOnly StartTime,
    TimeOnly EndTime,
    Guid UserId,
    string ResidentName,
    string? ApartmentNumber);

public record AdminRoomSummaryDto(
    Guid Id,
    string Name,
    bool IsActive,
    int ActiveSlotCount);

public class GetPropertyBookingsQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<GetPropertyBookingsQuery, PropertyBookingsDto>
{
    public async Task<PropertyBookingsDto> Handle(GetPropertyBookingsQuery request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var rooms = await db.LaundryRooms
            .Where(r => r.PropertyId == request.PropertyId)
            .Select(r => new AdminRoomSummaryDto(
                r.Id,
                r.Name,
                r.IsActive,
                r.TimeSlotTemplates.Count(t => t.IsActive)))
            .ToListAsync(cancellationToken);

        var bookings = await db.Bookings
            .Where(b =>
                b.LaundryRoom.PropertyId == request.PropertyId &&
                b.Date >= request.From &&
                b.Date <= request.To &&
                b.Status == BookingStatus.Active)
            .OrderBy(b => b.Date)
            .ThenBy(b => b.TimeSlotTemplate.StartTime)
            .Select(b => new AdminBookingDto(
                b.Id,
                b.LaundryRoomId,
                b.LaundryRoom.Name,
                b.TimeSlotTemplateId,
                b.Date,
                b.TimeSlotTemplate.StartTime,
                b.TimeSlotTemplate.EndTime,
                b.UserId,
                $"{b.User.FirstName} {b.User.LastName}".Trim(),
                db.UserComplexMemberships
                    .Where(m => m.UserId == b.UserId && m.PropertyId == request.PropertyId)
                    .Select(m => m.ApartmentNumber)
                    .FirstOrDefault()))
            .ToListAsync(cancellationToken);

        return new PropertyBookingsDto(bookings, rooms);
    }
}
