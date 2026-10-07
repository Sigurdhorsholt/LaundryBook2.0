using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.Auth.Commands;

// Lets an already logged-in user join the invite's property with their existing account.
public record AcceptInviteCommand(string InviteToken, string? ApartmentNumber, bool AcceptedTerms) : IRequest;

public class AcceptInviteCommandValidator : AbstractValidator<AcceptInviteCommand>
{
    public AcceptInviteCommandValidator()
    {
        RuleFor(x => x.InviteToken).NotEmpty();
        RuleFor(x => x.AcceptedTerms).Equal(true).WithMessage("Du skal acceptere vilkårene og privatlivspolitikken.");
    }
}

public class AcceptInviteCommandHandler(
    IAppDbContext db,
    ICurrentUserService currentUser) : IRequestHandler<AcceptInviteCommand>
{
    public async Task Handle(AcceptInviteCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new ForbiddenException("Du skal være logget ind.", ErrorCodes.NotSignedIn);
        var user = await db.Users.FindAsync([userId], cancellationToken)
            ?? throw new NotFoundException(nameof(User), userId);

        var invite = await InviteRedemption.FindRedeemableAsync(db, request.InviteToken, cancellationToken);
        InviteRedemption.EnsureEmailMatches(invite, user.Email);

        await InviteRedemption.ApplyAsync(db, invite, user, request.ApartmentNumber, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
    }
}
