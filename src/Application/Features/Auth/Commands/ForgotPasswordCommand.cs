using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands;

public record ForgotPasswordCommand(string Email) : IRequest;

public class ForgotPasswordCommandHandler(
    IAppDbContext db,
    IIdentityProvider identityProvider,
    IEmailService emailService) : IRequestHandler<ForgotPasswordCommand>
{
    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        // Silent success — never reveal whether the email is registered
        if (user is null)
            return;

        var resetLink = await identityProvider.GeneratePasswordResetLinkAsync(user.Email, cancellationToken);
        await emailService.SendPasswordResetEmailAsync(user.Email, resetLink, cancellationToken);
    }
}
