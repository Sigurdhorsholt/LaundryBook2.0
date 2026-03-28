using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Bookings.Commands;

public record CreateBookingCommand(Guid RoomId, Guid TimeSlotTemplateId, DateOnly Date) : IRequest<Guid>;

public class CreateBookingCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth,
    ICurrentUserService currentUser) : IRequestHandler<CreateBookingCommand, Guid>
{
    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.Resident, cancellationToken);

        var userId = currentUser.UserId!.Value;

        // Validate template belongs to this room and is active
        var template = await db.TimeSlotTemplates
            .FirstOrDefaultAsync(t =>
                t.Id == request.TimeSlotTemplateId &&
                t.LaundryRoomId == request.RoomId &&
                t.IsActive,
                cancellationToken)
            ?? throw new NotFoundException(nameof(TimeSlotTemplate), request.TimeSlotTemplateId);

        var settings = await db.ComplexSettings
            .FirstOrDefaultAsync(s => s.PropertyId == room.PropertyId, cancellationToken)
            ?? throw new NotFoundException(nameof(ComplexSettings), room.PropertyId);

        // Enforce lookahead limit
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var latestAllowed = today.AddDays(settings.BookingLookaheadDays);
        if (request.Date < today || request.Date > latestAllowed)
            throw new ConflictException("Datoen er uden for den tilladte bookingperiode.");

        // Slot must not be in the past
        var slotStartUtc = request.Date.ToDateTime(template.StartTime, DateTimeKind.Unspecified);
        if (slotStartUtc <= DateTime.UtcNow)
            throw new ConflictException("Tidspladsen er allerede passeret.");

        // Check slot is not already taken
        var slotTaken = await db.Bookings
            .AnyAsync(b =>
                b.LaundryRoomId == request.RoomId &&
                b.TimeSlotTemplateId == request.TimeSlotTemplateId &&
                b.Date == request.Date &&
                b.Status == BookingStatus.Active,
                cancellationToken);

        if (slotTaken)
            throw new ConflictException("Tidspladsen er allerede optaget.");

        // Enforce max concurrent bookings per user
        var activeCount = await db.Bookings
            .CountAsync(b =>
                b.UserId == userId &&
                b.LaundryRoom.PropertyId == room.PropertyId &&
                b.Date >= today &&
                b.Status == BookingStatus.Active,
                cancellationToken);

        if (activeCount >= settings.MaxConcurrentBookingsPerUser)
            throw new ConflictException($"Du har nået grænsen på {settings.MaxConcurrentBookingsPerUser} samtidige bookinger.");

        var booking = new Booking
        {
            UserId = userId,
            LaundryRoomId = request.RoomId,
            TimeSlotTemplateId = request.TimeSlotTemplateId,
            Date = request.Date,
            Status = BookingStatus.Active,
        };

        db.Bookings.Add(booking);
        await db.SaveChangesAsync(cancellationToken);

        return booking.Id;
    }
}
