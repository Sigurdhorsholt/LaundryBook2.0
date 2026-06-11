using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.TimeSlotTemplates.Commands;

public record DeactivateTimeSlotTemplateCommand(Guid RoomId, Guid TemplateId) : IRequest<int>;

public class DeactivateTimeSlotTemplateCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<DeactivateTimeSlotTemplateCommand, int>
{
    public async Task<int> Handle(DeactivateTimeSlotTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await db.TimeSlotTemplates
            .FirstOrDefaultAsync(t => t.Id == request.TemplateId && t.LaundryRoomId == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(TimeSlotTemplate), request.TemplateId);

        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        // Cancel all future active bookings that reference this template in the same transaction.
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var affected = await db.Bookings
            .Where(b =>
                b.TimeSlotTemplateId == request.TemplateId &&
                b.Date >= today &&
                b.Status == BookingStatus.Active)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var booking in affected)
        {
            booking.Status = BookingStatus.CancelledByAdmin;
            booking.CancelledAt = now;
        }

        template.IsActive = false;
        template.UpdatedAt = now;

        await db.SaveChangesAsync(cancellationToken);

        return affected.Count;
    }
}
