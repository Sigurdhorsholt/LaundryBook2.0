using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Queries;

public record GetPendingInvitesQuery(Guid PropertyId) : IRequest<IReadOnlyList<PendingInviteDto>>;

public record PendingInviteDto(
    Guid InviteId,
    string Email,
    UserRole Role,
    string? ApartmentNumber,
    DateTime ExpiresAt);

public class GetPendingInvitesQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<GetPendingInvitesQuery, IReadOnlyList<PendingInviteDto>>
{
    public async Task<IReadOnlyList<PendingInviteDto>> Handle(GetPendingInvitesQuery request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        return await db.UserInvites
            .Where(i =>
                i.PropertyId == request.PropertyId &&
                i.Email != null &&
                !i.IsUsed &&
                !i.IsMultiUse &&
                i.ExpiresAt > DateTime.UtcNow)
            .OrderBy(i => i.Email)
            .Select(i => new PendingInviteDto(i.Id, i.Email!, i.Role, i.ApartmentNumber, i.ExpiresAt))
            .ToListAsync(cancellationToken);
    }
}
