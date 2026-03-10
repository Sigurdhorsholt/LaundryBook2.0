using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.TimeSlotTemplates.Commands;

public record DeactivateTimeSlotTemplateCommand(Guid RoomId, Guid TemplateId) : IRequest;

public class DeactivateTimeSlotTemplateCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<DeactivateTimeSlotTemplateCommand>
{
    public async Task Handle(DeactivateTimeSlotTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await db.TimeSlotTemplates
            .FirstOrDefaultAsync(t => t.Id == request.TemplateId && t.LaundryRoomId == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(TimeSlotTemplate), request.TemplateId);

        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        template.IsActive = false;
        template.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}
