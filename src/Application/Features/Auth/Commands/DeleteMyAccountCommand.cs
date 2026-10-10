using Application.Common.Exceptions;
using Application.Common.Interfaces;
using MediatR;

namespace Application.Features.Auth.Commands;

public record DeleteMyAccountCommand : IRequest;

// The "delete my account" right (GDPR art. 17); the rules live in AccountDeletion
public class DeleteMyAccountCommandHandler(
    ICurrentUserService currentUser,
    AccountDeletion deletion) : IRequestHandler<DeleteMyAccountCommand>
{
    public async Task Handle(DeleteMyAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new ForbiddenException("Du skal være logget ind.", ErrorCodes.NotSignedIn);
        await deletion.DeleteAsync(userId, cancellationToken);
    }
}
