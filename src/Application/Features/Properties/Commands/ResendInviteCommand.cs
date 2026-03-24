using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record ResendInviteCommand(Guid PropertyId, Guid InviteId, string AppBaseUrl) : IRequest;

public class ResendInviteCommandHandler(
    IAppDbContext db,
    IEmailService emailService,
    PropertyAuthorizationService auth) : IRequestHandler<ResendInviteCommand>
{
    public async Task Handle(ResendInviteCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var old = await db.UserInvites
            .FirstOrDefaultAsync(
                i => i.Id == request.InviteId && i.PropertyId == request.PropertyId,
                cancellationToken)
            ?? throw new NotFoundException("UserInvite", request.InviteId);

        // Invalidate the old token so the previous link stops working
        old.IsUsed = true;

        var token = Guid.NewGuid().ToString("N");
        db.UserInvites.Add(new UserInvite
        {
            PropertyId = old.PropertyId,
            Role = old.Role,
            ApartmentNumber = old.ApartmentNumber,
            Email = old.Email,
            Token = token,
            IsMultiUse = false,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
        });

        await db.SaveChangesAsync(cancellationToken);

        var joinLink = $"{request.AppBaseUrl.TrimEnd('/')}/join?token={token}";
        await emailService.SendPasswordSetupEmailAsync(old.Email!, joinLink, cancellationToken);
    }
}
