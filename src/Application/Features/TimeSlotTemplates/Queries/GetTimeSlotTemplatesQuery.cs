using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.TimeSlotTemplates.Queries;

public record GetTimeSlotTemplatesQuery(Guid RoomId) : IRequest<List<TimeSlotTemplateDto>>;

public record TimeSlotTemplateDto(Guid Id, TimeOnly StartTime, TimeOnly EndTime, bool IsActive);

public class GetTimeSlotTemplatesQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<GetTimeSlotTemplatesQuery, List<TimeSlotTemplateDto>>
{
    public async Task<List<TimeSlotTemplateDto>> Handle(GetTimeSlotTemplatesQuery request, CancellationToken cancellationToken)
    {
        var room = await db.LaundryRooms
            .FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.LaundryRoom), request.RoomId);

        await auth.RequireRoleAsync(room.PropertyId, UserRole.Resident, cancellationToken);

        return await db.TimeSlotTemplates
            .Where(t => t.LaundryRoomId == request.RoomId && t.IsActive)
            .OrderBy(t => t.StartTime)
            .Select(t => new TimeSlotTemplateDto(t.Id, t.StartTime, t.EndTime, t.IsActive))
            .ToListAsync(cancellationToken);
    }
}
