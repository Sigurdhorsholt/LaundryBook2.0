using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Commands;

public record ActivatePropertyCommand(Guid PropertyId) : IRequest;

public class ActivatePropertyCommandHandler(IAppDbContext db, PropertyAuthorizationService auth)
    : IRequestHandler<ActivatePropertyCommand>
{
    public async Task Handle(ActivatePropertyCommand request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var property = await db.Properties
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException(nameof(Property), request.PropertyId);

        property.IsActive = true;
        await db.SaveChangesAsync(cancellationToken);
    }
}
