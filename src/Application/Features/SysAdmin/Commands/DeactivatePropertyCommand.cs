using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Commands;

public record DeactivatePropertyCommand(Guid PropertyId) : IRequest;

// Puts the property back in the approval queue: it can't send new invites until it's activated again.
// Members and bookings stay as they are.
public class DeactivatePropertyCommandHandler(IAppDbContext db, PropertyAuthorizationService auth)
    : IRequestHandler<DeactivatePropertyCommand>
{
    public async Task Handle(DeactivatePropertyCommand request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var property = await db.Properties
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException(nameof(Property), request.PropertyId);

        property.IsActive = false;
        await db.SaveChangesAsync(cancellationToken);
    }
}
