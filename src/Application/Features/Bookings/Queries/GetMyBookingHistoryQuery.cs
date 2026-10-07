using Application.Common.Authorization;
using Application.Common.Interfaces;
using Application.Common.Time;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Bookings.Queries;

public record GetMyBookingHistoryQuery(Guid PropertyId) : IRequest<List<MyBookingDto>>;

// The caller's bookings before today, newest first. Today's stay with the upcoming ones, since the
// bookings-at-a-time limit counts them until the day ends.
public class GetMyBookingHistoryQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth,
    ICurrentUserService currentUser) : IRequestHandler<GetMyBookingHistoryQuery, List<MyBookingDto>>
{
    private const int HistoryDays = 90;

    public async Task<List<MyBookingDto>> Handle(GetMyBookingHistoryQuery request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.Resident, cancellationToken);

        var userId = currentUser.UserId!.Value;
        var today = CopenhagenTime.Today;
        var from = today.AddDays(-HistoryDays);

        return await db.Bookings
            .Where(b =>
                b.UserId == userId &&
                b.LaundryRoom.PropertyId == request.PropertyId &&
                b.Date < today &&
                b.Date >= from &&
                b.Status == BookingStatus.Active)
            .OrderByDescending(b => b.Date)
            .ThenByDescending(b => b.TimeSlotTemplate.StartTime)
            .Select(b => new MyBookingDto(
                b.Id,
                b.LaundryRoomId,
                b.LaundryRoom.Name,
                b.TimeSlotTemplateId,
                b.TimeSlotTemplate.StartTime,
                b.TimeSlotTemplate.EndTime,
                b.Date,
                false,
                b.Machine != null ? b.Machine.Name : null))
            .ToListAsync(cancellationToken);
    }
}
