using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record ForcePasswordResetCommand(Guid PropertyId, Guid UserId) : IRequest;

public class ForcePasswordResetCommandHandler(
    IAppDbContext db,
    IIdentityProvider identityProvider,
    IEmailService emailService,
    PropertyAuthorizationService auth) : IRequestHandler<ForcePasswordResetCommand>
{
    public async Task Handle(ForcePasswordResetCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        var resetLink = await identityProvider.GeneratePasswordResetLinkAsync(user.Email, cancellationToken);
        await emailService.SendPasswordSetupEmailAsync(user.Email, resetLink, cancellationToken);
    }
}
