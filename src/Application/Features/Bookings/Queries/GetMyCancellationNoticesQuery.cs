using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Time;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Bookings.Queries;

public record GetMyCancellationNoticesQuery : IRequest<IReadOnlyList<CancellationNoticeDto>>;

public record CancellationNoticeDto(
    Guid BookingId,
    DateOnly Date,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string RoomName,
    string? MachineName);

// Bookings the board cancelled that the resident hasn't been told about yet. Past dates are left
// out: by then the notice no longer helps anyone plan.
public class GetMyCancellationNoticesQueryHandler(
    IAppDbContext db,
    ICurrentUserService currentUser) : IRequestHandler<GetMyCancellationNoticesQuery, IReadOnlyList<CancellationNoticeDto>>
{
    public async Task<IReadOnlyList<CancellationNoticeDto>> Handle(GetMyCancellationNoticesQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new ForbiddenException("Du skal være logget ind.", ErrorCodes.NotSignedIn);
        var today = CopenhagenTime.Today;

        return await db.Bookings
            .Where(b => b.UserId == userId &&
                        b.Status == BookingStatus.CancelledByAdmin &&
                        b.CancellationSeenAt == null &&
                        b.Date >= today)
            .OrderBy(b => b.Date).ThenBy(b => b.TimeSlotTemplate.StartTime)
            .Select(b => new CancellationNoticeDto(
                b.Id,
                b.Date,
                b.TimeSlotTemplate.StartTime,
                b.TimeSlotTemplate.EndTime,
                b.LaundryRoom.Name,
                b.Machine != null ? b.Machine.Name : null))
            .ToListAsync(cancellationToken);
    }
}
