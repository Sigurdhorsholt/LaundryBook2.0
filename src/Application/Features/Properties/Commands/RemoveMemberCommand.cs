using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record RemoveMemberCommand(Guid PropertyId, Guid UserId) : IRequest;

public class RemoveMemberCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<RemoveMemberCommand>
{
    public async Task Handle(RemoveMemberCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var membership = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == request.UserId && m.PropertyId == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException("Membership", $"{request.UserId} in property {request.PropertyId}");

        db.UserComplexMemberships.Remove(membership);
        await db.SaveChangesAsync(cancellationToken);
    }
}
