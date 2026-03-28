using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Bookings.Queries;

public record GetMyBookingsQuery(Guid PropertyId) : IRequest<List<MyBookingDto>>;

public record MyBookingDto(
    Guid Id,
    Guid RoomId,
    string RoomName,
    Guid TimeSlotTemplateId,
    TimeOnly StartTime,
    TimeOnly EndTime,
    DateOnly Date,
    bool CanCancel);

public class GetMyBookingsQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth,
    ICurrentUserService currentUser) : IRequestHandler<GetMyBookingsQuery, List<MyBookingDto>>
{
    public async Task<List<MyBookingDto>> Handle(GetMyBookingsQuery request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.Resident, cancellationToken);

        var userId = currentUser.UserId!.Value;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var settings = await db.ComplexSettings
            .FirstOrDefaultAsync(s => s.PropertyId == request.PropertyId, cancellationToken);

        var cancellationWindowMinutes = settings?.CancellationWindowMinutes ?? 60;
        var now = DateTime.UtcNow;

        return await db.Bookings
            .Where(b =>
                b.UserId == userId &&
                b.LaundryRoom.PropertyId == request.PropertyId &&
                b.Date >= today &&
                b.Status == BookingStatus.Active)
            .Include(b => b.LaundryRoom)
            .Include(b => b.TimeSlotTemplate)
            .OrderBy(b => b.Date)
            .ThenBy(b => b.TimeSlotTemplate.StartTime)
            .Select(b => new MyBookingDto(
                b.Id,
                b.LaundryRoomId,
                b.LaundryRoom.Name,
                b.TimeSlotTemplateId,
                b.TimeSlotTemplate.StartTime,
                b.TimeSlotTemplate.EndTime,
                b.Date,
                (b.Date.ToDateTime(b.TimeSlotTemplate.StartTime, DateTimeKind.Unspecified) - now).TotalMinutes > cancellationWindowMinutes))
            .ToListAsync(cancellationToken);
    }
}
