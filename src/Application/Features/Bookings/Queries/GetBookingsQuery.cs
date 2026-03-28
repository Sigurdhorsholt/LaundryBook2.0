using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Bookings.Queries;

public record GetBookingsQuery(Guid RoomId, DateOnly From, DateOnly To) : IRequest<List<BookingDto>>;

public record BookingDto(
    Guid Id,
    Guid TimeSlotTemplateId,
    DateOnly Date,
    bool IsOwn,
    string Label,
    bool CanCancel);

public class GetBookingsQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth,
    ICurrentUserService currentUser) : IRequestHandler<GetBookingsQuery, List<BookingDto>>
{
    public async Task<List<BookingDto>> Handle(GetBookingsQuery request, CancellationToken cancellationToken)
    {
        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.Resident, cancellationToken);

        var userId = currentUser.UserId!.Value;

        var settings = await db.ComplexSettings
            .FirstOrDefaultAsync(s => s.PropertyId == room.PropertyId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.ComplexSettings), room.PropertyId);

        var now = DateTime.UtcNow;
        var cancellationCutoffMinutes = settings.CancellationWindowMinutes;

        var bookings = await db.Bookings
            .Where(b =>
                b.LaundryRoomId == request.RoomId &&
                b.Date >= request.From &&
                b.Date <= request.To &&
                b.Status == BookingStatus.Active)
            .Include(b => b.User)
            .Include(b => b.TimeSlotTemplate)
            .ToListAsync(cancellationToken);

        // Need apartment number for ApartmentOnly visibility
        var membershipsByUser = await db.UserComplexMemberships
            .Where(m => m.PropertyId == room.PropertyId && bookings.Select(b => b.UserId).Contains(m.UserId))
            .ToDictionaryAsync(m => m.UserId, cancellationToken);

        return bookings.Select(b =>
        {
            var isOwn = b.UserId == userId;

            string label;
            if (isOwn)
            {
                label = "Min booking";
            }
            else
            {
                label = settings.BookingVisibility switch
                {
                    BookingVisibility.FullName => $"{b.User.FirstName} {b.User.LastName}".Trim(),
                    BookingVisibility.ApartmentOnly =>
                        membershipsByUser.TryGetValue(b.UserId, out var m) && m.ApartmentNumber is not null
                            ? $"Lejl. {m.ApartmentNumber}"
                            : "Optaget",
                    _ => "Optaget",
                };
            }

            // canCancel: only own bookings, only within cancellation window
            var slotStartUtc = b.Date.ToDateTime(b.TimeSlotTemplate.StartTime, DateTimeKind.Unspecified);
            var canCancel = isOwn && (slotStartUtc - now).TotalMinutes > cancellationCutoffMinutes;

            return new BookingDto(b.Id, b.TimeSlotTemplateId, b.Date, isOwn, label, canCancel);
        }).ToList();
    }
}
