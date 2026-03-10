using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.LaundryMachines.Commands;

public record DeactivateLaundryMachineCommand(Guid RoomId, Guid MachineId) : IRequest;

public class DeactivateLaundryMachineCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<DeactivateLaundryMachineCommand>
{
    public async Task Handle(DeactivateLaundryMachineCommand request, CancellationToken cancellationToken)
    {
        var machine = await db.LaundryMachines
            .FirstOrDefaultAsync(m => m.Id == request.MachineId && m.LaundryRoomId == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryMachine), request.MachineId);

        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        machine.IsActive = false;
        machine.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}
