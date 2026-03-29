using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record DeleteInviteCommand(Guid PropertyId, Guid InviteId) : IRequest;

public class DeleteInviteCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<DeleteInviteCommand>
{
    public async Task Handle(DeleteInviteCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var invite = await db.UserInvites
            .FirstOrDefaultAsync(
                i => i.Id == request.InviteId && i.PropertyId == request.PropertyId,
                cancellationToken)
            ?? throw new NotFoundException("UserInvite", request.InviteId);

        db.UserInvites.Remove(invite);
        await db.SaveChangesAsync(cancellationToken);
    }
}
