using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Properties.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Queries;

public record GetPropertyQuery(Guid PropertyId) : IRequest<PropertyDetailDto>;

public class GetPropertyQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<GetPropertyQuery, PropertyDetailDto>
{
    public async Task<PropertyDetailDto> Handle(GetPropertyQuery request, CancellationToken cancellationToken)
    {
        // At minimum must be a Resident of this property
        await auth.RequireRoleAsync(request.PropertyId, Domain.Enums.UserRole.Resident, cancellationToken);

        var property = await db.Properties
            .Include(p => p.Settings)
            .Include(p => p.Memberships)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Property), request.PropertyId);

        return new PropertyDetailDto(
            property.Id,
            property.Name,
            property.Address,
            property.Settings is null
                ? new ComplexSettingsDto(Domain.Enums.BookingMode.BookSpecificMachine, 60, 2, 14, Domain.Enums.BookingVisibility.ApartmentOnly)
                : new ComplexSettingsDto(
                    property.Settings.BookingMode,
                    property.Settings.CancellationWindowMinutes,
                    property.Settings.MaxConcurrentBookingsPerUser,
                    property.Settings.BookingLookaheadDays,
                    property.Settings.BookingVisibility),
            property.Memberships.Select(m => new MemberDto(
                m.UserId,
                m.User.Email,
                m.User.FirstName,
                m.User.LastName,
                m.Role,
                m.ApartmentNumber)).ToList());
    }
}
