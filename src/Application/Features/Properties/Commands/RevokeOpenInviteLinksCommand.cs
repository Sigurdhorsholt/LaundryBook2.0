using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;

namespace Application.Features.Properties.Commands;

public record RevokeOpenInviteLinksCommand(Guid PropertyId) : IRequest<int>;

public class RevokeOpenInviteLinksCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<RevokeOpenInviteLinksCommand, int>
{
    public async Task<int> Handle(RevokeOpenInviteLinksCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var revoked = await OpenInviteLinks.RevokeAsync(db, request.PropertyId, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        return revoked;
    }
}
