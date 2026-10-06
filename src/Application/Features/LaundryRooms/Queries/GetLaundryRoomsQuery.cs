using Application.Common.Authorization;
using Application.Common.Time;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.LaundryRooms.Queries;

public record GetLaundryRoomsQuery(Guid PropertyId) : IRequest<List<LaundryRoomDto>>;

public record LaundryRoomDto(Guid Id, string Name, string? Description, bool IsActive, int MachineCount, int TimeSlotCount, int UpcomingBookingCount);

public class GetLaundryRoomsQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<GetLaundryRoomsQuery, List<LaundryRoomDto>>
{
    public async Task<List<LaundryRoomDto>> Handle(GetLaundryRoomsQuery request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.Resident, cancellationToken);

        var today = CopenhagenTime.Today;

        return await db.LaundryRooms
            .Where(r => r.PropertyId == request.PropertyId && r.IsActive)
            .Select(r => new LaundryRoomDto(
                r.Id,
                r.Name,
                r.Description,
                r.IsActive,
                r.Machines.Count(m => m.IsActive),
                r.TimeSlotTemplates.Count(t => t.IsActive),
                r.Bookings.Count(b => b.Date >= today && b.Status == BookingStatus.Active)))
            .ToListAsync(cancellationToken);
    }
}
