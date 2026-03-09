using Application.Common.Authorization;
using Application.Common.Interfaces;
using Application.Features.Properties.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Queries;

public record GetMyPropertiesQuery : IRequest<IReadOnlyList<PropertyDto>>;

public class GetMyPropertiesQueryHandler(
    IAppDbContext db,
    ICurrentUserService currentUser,
    PropertyAuthorizationService auth) : IRequestHandler<GetMyPropertiesQuery, IReadOnlyList<PropertyDto>>
{
    public async Task<IReadOnlyList<PropertyDto>> Handle(GetMyPropertiesQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId!.Value;
        var isSysAdmin = await auth.IsSysAdminAsync(cancellationToken);

        var query = db.Properties
            .Include(p => p.Settings)
            .Include(p => p.Memberships)
            .AsQueryable();

        // SysAdmin sees all; others see only their own
        if (!isSysAdmin)
            query = query.Where(p => p.Memberships.Any(m => m.UserId == userId));

        var properties = await query.ToListAsync(cancellationToken);

        return properties.Select(p => new PropertyDto(
            p.Id,
            p.Name,
            p.Address,
            p.Settings is null ? DefaultSettings() : new ComplexSettingsDto(
                p.Settings.BookingMode,
                p.Settings.CancellationWindowMinutes,
                p.Settings.MaxConcurrentBookingsPerUser),
            p.Memberships.Count)).ToList();
    }

    private static ComplexSettingsDto DefaultSettings() =>
        new(Domain.Enums.BookingMode.BookSpecificMachine, 60, 2);
}
