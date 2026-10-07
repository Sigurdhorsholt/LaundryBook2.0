using Application.Common.Authorization;
using Application.Common.Bookings;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.LaundryRooms.Commands;

public record DeactivateLaundryRoomCommand(Guid RoomId) : IRequest<int>;

public class DeactivateLaundryRoomCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<DeactivateLaundryRoomCommand, int>
{
    public async Task<int> Handle(DeactivateLaundryRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var cancelled = await db.Bookings
            .Where(b => b.LaundryRoomId == room.Id)
            .CancelUpcomingByAdminAsync(cancellationToken);

        room.IsActive = false;
        room.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);

        return cancelled;
    }
}
