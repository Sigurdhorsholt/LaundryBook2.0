using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Bookings.Commands;

public record CancelBookingCommand(Guid BookingId) : IRequest;

public class CancelBookingCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth,
    ICurrentUserService currentUser) : IRequestHandler<CancelBookingCommand>
{
    public async Task Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await db.Bookings
            .Include(b => b.LaundryRoom)
            .Include(b => b.TimeSlotTemplate)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Booking), request.BookingId);

        var userId = currentUser.UserId!.Value;

        // Only the owner or an admin can cancel
        var isOwner = booking.UserId == userId;
        if (!isOwner)
        {
            await auth.RequireRoleAsync(booking.LaundryRoom.PropertyId, UserRole.ComplexAdmin, cancellationToken);
        }

        if (booking.Status != BookingStatus.Active)
            throw new ConflictException("Bookingen er allerede aflyst.");

        // Enforce cancellation window (admins bypass this)
        if (isOwner)
        {
            var settings = await db.ComplexSettings
                .FirstOrDefaultAsync(s => s.PropertyId == booking.LaundryRoom.PropertyId, cancellationToken);

            var windowMinutes = settings?.CancellationWindowMinutes ?? 60;
            var slotStart = booking.Date.ToDateTime(booking.TimeSlotTemplate.StartTime, DateTimeKind.Unspecified);
            if ((slotStart - DateTime.UtcNow).TotalMinutes <= windowMinutes)
                throw new ConflictException("Aflysningstiden er udløbet.");
        }

        booking.Status = isOwner ? BookingStatus.CancelledByUser : BookingStatus.CancelledByAdmin;
        booking.CancelledAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}
