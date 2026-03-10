using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.LaundryMachines.Commands;

public record CreateLaundryMachineCommand(Guid RoomId, string Name, MachineType MachineType) : IRequest<Guid>;

public class CreateLaundryMachineCommandValidator : AbstractValidator<CreateLaundryMachineCommand>
{
    public CreateLaundryMachineCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MachineType).IsInEnum();
    }
}

public class CreateLaundryMachineCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<CreateLaundryMachineCommand, Guid>
{
    public async Task<Guid> Handle(CreateLaundryMachineCommand request, CancellationToken cancellationToken)
    {
        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var machine = new LaundryMachine
        {
            LaundryRoomId = request.RoomId,
            Name = request.Name,
            MachineType = request.MachineType,
        };

        db.LaundryMachines.Add(machine);
        await db.SaveChangesAsync(cancellationToken);

        return machine.Id;
    }
}
