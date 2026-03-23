using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record InviteUserByEmailCommand(
    Guid PropertyId,
    string Email,
    UserRole Role,
    string? ApartmentNumber) : IRequest<string>;

public class InviteUserByEmailCommandValidator : AbstractValidator<InviteUserByEmailCommand>
{
    public InviteUserByEmailCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Role).IsInEnum()
            .NotEqual(UserRole.SysAdmin).WithMessage("Cannot assign SysAdmin role via invite.");
        RuleFor(x => x.ApartmentNumber).MaximumLength(20).When(x => x.ApartmentNumber is not null);
    }
}

public class InviteUserByEmailCommandHandler(
    IAppDbContext db,
    IIdentityProvider identityProvider,
    IEmailService emailService,
    PropertyAuthorizationService auth) : IRequestHandler<InviteUserByEmailCommand, string>
{
    public async Task<string> Handle(InviteUserByEmailCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        // Reuse an existing account if the email is already in our system
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null)
        {
            var externalId = await identityProvider.CreateUserAsync(request.Email, cancellationToken);
            user = new User { ExternalId = externalId, Email = request.Email };
            db.Users.Add(user);
        }

        var existing = await db.UserComplexMemberships
            .FirstOrDefaultAsync(m => m.UserId == user.Id && m.PropertyId == request.PropertyId, cancellationToken);

        if (existing is not null)
        {
            existing.Role = request.Role;
            existing.ApartmentNumber = request.ApartmentNumber;
        }
        else
        {
            db.UserComplexMemberships.Add(new UserComplexMembership
            {
                UserId = user.Id,
                PropertyId = request.PropertyId,
                Role = request.Role,
                ApartmentNumber = request.ApartmentNumber,
            });
        }

        await db.SaveChangesAsync(cancellationToken);

        var resetLink = await identityProvider.GeneratePasswordResetLinkAsync(request.Email, cancellationToken);
        await emailService.SendPasswordSetupEmailAsync(request.Email, resetLink, cancellationToken);

        return request.Email;
    }
}
