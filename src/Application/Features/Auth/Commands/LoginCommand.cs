using Application.Common.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands;

public record LoginCommand(string IdToken) : IRequest<LoginResult>;

public record LoginResult(string JwtToken, Guid UserId);

public class LoginCommandHandler(
    IIdentityProvider identityProvider,
    IJwtService jwtService,
    IAppDbContext db) : IRequestHandler<LoginCommand, LoginResult>
{
    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var external = await identityProvider.VerifyTokenAsync(request.IdToken, cancellationToken);

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.ExternalId == external.ExternalId, cancellationToken);

        if (user is null)
        {
            // Auto-provision on first login — profile details filled in later
            user = new User
            {
                ExternalId = external.ExternalId,
                Email = external.Email,
                FirstName = string.Empty,
                LastName = string.Empty,
            };
            db.Users.Add(user);
            await db.SaveChangesAsync(cancellationToken);
        }

        var token = jwtService.GenerateToken(user);
        return new LoginResult(token, user.Id);
    }
}
