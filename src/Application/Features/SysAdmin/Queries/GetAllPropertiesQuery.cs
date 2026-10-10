using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Time;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Queries;

public record GetAllPropertiesQuery : IRequest<IReadOnlyList<SystemPropertyDto>>;

public record SystemPropertyDto(
    Guid Id,
    string Name,
    string Address,
    bool IsActive,
    DateTime CreatedAt,
    int Members,
    int Admins,
    int Rooms,
    int BookingsLast30Days,
    int BookingsNext7Days);

// Every property on the platform, including ones the SysAdmin isn't a member of
public class GetAllPropertiesQueryHandler(IAppDbContext db, PropertyAuthorizationService auth)
    : IRequestHandler<GetAllPropertiesQuery, IReadOnlyList<SystemPropertyDto>>
{
    public async Task<IReadOnlyList<SystemPropertyDto>> Handle(GetAllPropertiesQuery request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var today = CopenhagenTime.Today;
        var monthAgo = today.AddDays(-30);
        var weekAhead = today.AddDays(7);

        return await db.Properties
            .OrderBy(p => p.Name)
            .Select(p => new SystemPropertyDto(
                p.Id,
                p.Name,
                p.Address,
                p.IsActive,
                p.CreatedAt,
                p.Memberships.Count(m => m.IsActive),
                p.Memberships.Count(m => m.IsActive && m.Role >= UserRole.ComplexAdmin),
                p.LaundryRooms.Count(r => r.IsActive),
                db.Bookings.Count(b => b.LaundryRoom.PropertyId == p.Id && b.Status == BookingStatus.Active
                                       && b.Date >= monthAgo && b.Date < today),
                db.Bookings.Count(b => b.LaundryRoom.PropertyId == p.Id && b.Status == BookingStatus.Active
                                       && b.Date >= today && b.Date < weekAhead)))
            .ToListAsync(cancellationToken);
    }
}
