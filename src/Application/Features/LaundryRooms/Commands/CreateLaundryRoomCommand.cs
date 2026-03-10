using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.LaundryRooms.Commands;

public record CreateLaundryRoomCommand(Guid PropertyId, string Name, string? Description) : IRequest<Guid>;

public class CreateLaundryRoomCommandValidator : AbstractValidator<CreateLaundryRoomCommand>
{
    public CreateLaundryRoomCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}

public class CreateLaundryRoomCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<CreateLaundryRoomCommand, Guid>
{
    public async Task<Guid> Handle(CreateLaundryRoomCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var room = new LaundryRoom
        {
            PropertyId = request.PropertyId,
            Name = request.Name,
            Description = request.Description,
        };

        db.LaundryRooms.Add(room);
        await db.SaveChangesAsync(cancellationToken);

        return room.Id;
    }
}
