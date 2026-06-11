using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Queries;

public record GetPendingPropertiesQuery : IRequest<IReadOnlyList<PendingPropertyDto>>;

public record PendingPropertyDto(
    Guid Id,
    string Name,
    string Address,
    DateTime CreatedAt,
    string? AdminName,
    string? AdminEmail);

public class GetPendingPropertiesQueryHandler(IAppDbContext db, PropertyAuthorizationService auth)
    : IRequestHandler<GetPendingPropertiesQuery, IReadOnlyList<PendingPropertyDto>>
{
    public async Task<IReadOnlyList<PendingPropertyDto>> Handle(GetPendingPropertiesQuery request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        return await db.Properties
            .Where(p => !p.IsActive)
            .OrderBy(p => p.CreatedAt)
            .Select(p => new PendingPropertyDto(
                p.Id,
                p.Name,
                p.Address,
                p.CreatedAt,
                p.Memberships
                    .Where(m => m.Role == UserRole.ComplexAdmin)
                    .Select(m => m.User.FirstName + " " + m.User.LastName)
                    .FirstOrDefault(),
                p.Memberships
                    .Where(m => m.Role == UserRole.ComplexAdmin)
                    .Select(m => m.User.Email)
                    .FirstOrDefault()))
            .ToListAsync(cancellationToken);
    }
}
