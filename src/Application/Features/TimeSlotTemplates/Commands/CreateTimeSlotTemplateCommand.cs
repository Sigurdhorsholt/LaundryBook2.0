using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.TimeSlotTemplates.Commands;

public record CreateTimeSlotTemplateCommand(Guid RoomId, TimeOnly StartTime, TimeOnly EndTime) : IRequest<Guid>;

public class CreateTimeSlotTemplateCommandValidator : AbstractValidator<CreateTimeSlotTemplateCommand>
{
    public CreateTimeSlotTemplateCommandValidator()
    {
        RuleFor(x => x).Must(x => x.StartTime < x.EndTime)
            .WithMessage("StartTime must be before EndTime.");
    }
}

public class CreateTimeSlotTemplateCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<CreateTimeSlotTemplateCommand, Guid>
{
    public async Task<Guid> Handle(CreateTimeSlotTemplateCommand request, CancellationToken cancellationToken)
    {
        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var overlaps = await db.TimeSlotTemplates.AnyAsync(
            t => t.LaundryRoomId == request.RoomId
              && t.IsActive
              && t.StartTime < request.EndTime
              && t.EndTime > request.StartTime,
            cancellationToken);

        if (overlaps)
            throw new ValidationException("Time slot overlaps with an existing slot.");

        var template = new TimeSlotTemplate
        {
            LaundryRoomId = request.RoomId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
        };

        db.TimeSlotTemplates.Add(template);
        await db.SaveChangesAsync(cancellationToken);

        return template.Id;
    }
}
