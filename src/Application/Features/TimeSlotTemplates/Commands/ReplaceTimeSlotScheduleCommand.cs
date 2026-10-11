using Application.Common.Authorization;
using Application.Common.Bookings;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.TimeSlotTemplates.Commands;

// Id set = keep that existing template (its stored times win); Id null = create a new one.
public record TimeSlotScheduleEntry(Guid? Id, TimeOnly StartTime, TimeOnly EndTime);

public record ReplaceTimeSlotScheduleCommand(Guid RoomId, List<TimeSlotScheduleEntry> Slots) : IRequest<int>;

public class ReplaceTimeSlotScheduleCommandValidator : AbstractValidator<ReplaceTimeSlotScheduleCommand>
{
    public ReplaceTimeSlotScheduleCommandValidator()
    {
        RuleFor(x => x.Slots).NotNull();
        RuleForEach(x => x.Slots)
            .Must(s => s.Id != null || s.StartTime < s.EndTime)
            .WithMessage("StartTime must be before EndTime.");
    }
}

public class ReplaceTimeSlotScheduleCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<ReplaceTimeSlotScheduleCommand, int>
{
    public async Task<int> Handle(ReplaceTimeSlotScheduleCommand request, CancellationToken cancellationToken)
    {
        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var active = await db.TimeSlotTemplates
            .Where(t => t.LaundryRoomId == request.RoomId && t.IsActive)
            .ToDictionaryAsync(t => t.Id, cancellationToken);

        var desired = new List<(TimeOnly Start, TimeOnly End)>();
        var keepIds = new HashSet<Guid>();
        foreach (var slot in request.Slots)
        {
            if (slot.Id is { } id)
            {
                if (!active.TryGetValue(id, out var existing))
                    throw new NotFoundException(nameof(TimeSlotTemplate), id);
                if (!keepIds.Add(id))
                    throw new ConflictException("Den samme vasketid er sendt mere end én gang.", ErrorCodes.SlotDuplicate);
                desired.Add((existing.StartTime, existing.EndTime));
            }
            else
            {
                desired.Add((slot.StartTime, slot.EndTime));
            }
        }

        desired.Sort((a, b) => a.Start.CompareTo(b.Start));
        for (var i = 1; i < desired.Count; i++)
        {
            if (desired[i].Start < desired[i - 1].End)
                throw new ConflictException("Vasketiden overlapper en eksisterende vasketid.", ErrorCodes.SlotOverlap);
        }

        var removeIds = active.Keys.Where(id => !keepIds.Contains(id)).ToList();
        var now = DateTime.UtcNow;

        var cancelled = await db.Bookings
            .Where(b => removeIds.Contains(b.TimeSlotTemplateId))
            .CancelUpcomingByAdminAsync(cancellationToken);

        foreach (var id in removeIds)
        {
            active[id].IsActive = false;
            active[id].UpdatedAt = now;
        }

        foreach (var slot in request.Slots.Where(s => s.Id == null))
        {
            db.TimeSlotTemplates.Add(new TimeSlotTemplate
            {
                LaundryRoomId = request.RoomId,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
            });
        }

        // Single SaveChanges so removals, booking cancellations and creations commit atomically.
        await db.SaveChangesAsync(cancellationToken);

        return cancelled;
    }
}
