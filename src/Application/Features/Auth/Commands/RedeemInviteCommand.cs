using Application.Common.Interfaces;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands;

public record RedeemInviteCommand(
    string IdToken,
    string InviteToken,
    string? ApartmentNumber,
    string FirstName,
    string LastName,
    bool AcceptedTerms) : IRequest<RedeemInviteResult>;

public record RedeemInviteResult(string JwtToken, Guid UserId);

public class RedeemInviteCommandValidator : AbstractValidator<RedeemInviteCommand>
{
    public RedeemInviteCommandValidator()
    {
        RuleFor(x => x.IdToken).NotEmpty();
        RuleFor(x => x.InviteToken).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.AcceptedTerms).Equal(true).WithMessage("Du skal acceptere vilkårene og privatlivspolitikken.");
    }
}

public class RedeemInviteCommandHandler(
    IAppDbContext db,
    IIdentityProvider identityProvider,
    IJwtService jwtService) : IRequestHandler<RedeemInviteCommand, RedeemInviteResult>
{
    public async Task<RedeemInviteResult> Handle(RedeemInviteCommand request, CancellationToken cancellationToken)
    {
        var external = await identityProvider.VerifyTokenAsync(request.IdToken, cancellationToken);

        var invite = await InviteRedemption.FindRedeemableAsync(db, request.InviteToken, cancellationToken);
        InviteRedemption.EnsureEmailMatches(invite, external.Email);

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.ExternalId == external.ExternalId, cancellationToken);

        if (user is null)
        {
            user = new User
            {
                ExternalId = external.ExternalId,
                Email = external.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
            };
            db.Users.Add(user);
        }
        else
        {
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
        }

        await InviteRedemption.ApplyAsync(db, invite, user, request.ApartmentNumber, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

        var token = jwtService.GenerateToken(user);
        return new RedeemInviteResult(token, user.Id);
    }
}
