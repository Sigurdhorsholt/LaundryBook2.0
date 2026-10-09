using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Auth;
using MediatR;

namespace Application.Features.SysAdmin.Commands;

public record DeleteUserCommand(Guid UserId) : IRequest;

// A SysAdmin deleting someone's account from /system, e.g. on a GDPR request by email
public class DeleteUserCommandHandler(
    PropertyAuthorizationService auth,
    ICurrentUserService currentUser,
    AccountDeletion deletion) : IRequestHandler<DeleteUserCommand>
{
    public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        // Your own account goes through Min side, which also signs you out afterwards
        if (currentUser.UserId == request.UserId)
            throw new ForbiddenException("Slet din egen konto under Min side.", ErrorCodes.CannotRemoveSelf);

        await deletion.DeleteAsync(request.UserId, cancellationToken);
    }
}
