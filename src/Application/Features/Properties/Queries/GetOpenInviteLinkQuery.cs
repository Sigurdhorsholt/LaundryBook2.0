using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Queries;

public record GetOpenInviteLinkQuery(Guid PropertyId) : IRequest<OpenInviteLinkDto?>;

public record OpenInviteLinkDto(string Token, DateTime CreatedAt, DateTime ExpiresAt);

public class GetOpenInviteLinkQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<GetOpenInviteLinkQuery, OpenInviteLinkDto?>
{
    public async Task<OpenInviteLinkDto?> Handle(GetOpenInviteLinkQuery request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        return await OpenInviteLinks.Active(db, request.PropertyId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new OpenInviteLinkDto(i.Token, i.CreatedAt, i.ExpiresAt))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
