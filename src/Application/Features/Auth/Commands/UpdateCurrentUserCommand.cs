using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands;

public record UpdateCurrentUserCommand(string FirstName, string LastName) : IRequest;

public class UpdateCurrentUserCommandHandler(
    ICurrentUserService currentUser,
    IAppDbContext db) : IRequestHandler<UpdateCurrentUserCommand>
{
    public async Task Handle(UpdateCurrentUserCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not found.");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        await db.SaveChangesAsync(cancellationToken);
    }
}
