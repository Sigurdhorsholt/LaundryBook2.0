using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.LaundryRooms.Commands;

public record UpdateLaundryRoomCommand(Guid RoomId, string Name, string? Description) : IRequest;

public class UpdateLaundryRoomCommandValidator : AbstractValidator<UpdateLaundryRoomCommand>
{
    public UpdateLaundryRoomCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}

public class UpdateLaundryRoomCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<UpdateLaundryRoomCommand>
{
    public async Task Handle(UpdateLaundryRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        room.Name = request.Name;
        room.Description = request.Description;
        room.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}
