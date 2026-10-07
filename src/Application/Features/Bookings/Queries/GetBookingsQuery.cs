using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Time;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Bookings.Queries;

public record GetBookingsQuery(Guid RoomId, DateOnly From, DateOnly To) : IRequest<List<BookingDto>>;

// How the client should name a booking; the client formats it so the text follows the user's language
public enum BookingLabelKind
{
    Own = 0,
    Name = 1,
    Apartment = 2,
    Anonymous = 3,
}

public record BookingDto(
    Guid Id,
    Guid TimeSlotTemplateId,
    DateOnly Date,
    bool IsOwn,
    // Danish text kept for frontend builds from before LabelKind; remove once those are gone
    string Label,
    BookingLabelKind LabelKind,
    string? LabelValue,
    bool CanCancel,
    Guid? MachineId,
    string? MachineName);

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
            .Include(b => b.Machine)
            .ToListAsync(cancellationToken);

        // Need apartment number for ApartmentOnly visibility
        var membershipsByUser = await db.UserComplexMemberships
            .Where(m => m.PropertyId == room.PropertyId && bookings.Select(b => b.UserId).Contains(m.UserId))
            .ToDictionaryAsync(m => m.UserId, cancellationToken);

        return bookings.Select(b =>
        {
            var isOwn = b.UserId == userId;

            var apartment = membershipsByUser.TryGetValue(b.UserId, out var m) ? m.ApartmentNumber : null;
            var (kind, value) = isOwn
                ? (BookingLabelKind.Own, (string?)null)
                : settings.BookingVisibility switch
                {
                    BookingVisibility.FullName => (BookingLabelKind.Name, $"{b.User.FirstName} {b.User.LastName}".Trim()),
                    BookingVisibility.ApartmentOnly when apartment is not null => (BookingLabelKind.Apartment, apartment),
                    _ => (BookingLabelKind.Anonymous, null),
                };
            var label = kind switch
            {
                BookingLabelKind.Own => "Min booking",
                BookingLabelKind.Name => value!,
                BookingLabelKind.Apartment => $"Lejl. {value}",
                _ => "Optaget",
            };

            // canCancel: only own bookings, only within cancellation window
            var slotStartUtc = CopenhagenTime.ToUtc(b.Date, b.TimeSlotTemplate.StartTime);
            var canCancel = isOwn && (slotStartUtc - now).TotalMinutes > cancellationCutoffMinutes;

            return new BookingDto(b.Id, b.TimeSlotTemplateId, b.Date, isOwn, label, kind, value, canCancel, b.MachineId, b.Machine?.Name);
        }).ToList();
    }
}
