using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.LaundryMachines.Commands;

public record UpdateLaundryMachineCommand(Guid RoomId, Guid MachineId, string Name, MachineType MachineType) : IRequest;

public class UpdateLaundryMachineCommandValidator : AbstractValidator<UpdateLaundryMachineCommand>
{
    public UpdateLaundryMachineCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MachineType).IsInEnum();
    }
}

public class UpdateLaundryMachineCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<UpdateLaundryMachineCommand>
{
    public async Task Handle(UpdateLaundryMachineCommand request, CancellationToken cancellationToken)
    {
        var machine = await db.LaundryMachines
            .FirstOrDefaultAsync(m => m.Id == request.MachineId && m.LaundryRoomId == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryMachine), request.MachineId);

        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        machine.Name = request.Name;
        machine.MachineType = request.MachineType;
        machine.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}
