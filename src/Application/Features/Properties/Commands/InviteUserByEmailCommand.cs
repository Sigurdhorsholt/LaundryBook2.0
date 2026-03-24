using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.Properties.Commands;

public record InviteUserByEmailCommand(
    Guid PropertyId,
    string Email,
    UserRole Role,
    string? ApartmentNumber,
    string AppBaseUrl) : IRequest<string>;

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
    IEmailService emailService,
    PropertyAuthorizationService auth) : IRequestHandler<InviteUserByEmailCommand, string>
{
    public async Task<string> Handle(InviteUserByEmailCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var token = Guid.NewGuid().ToString("N"); // 32-char hex, URL-safe

        db.UserInvites.Add(new UserInvite
        {
            PropertyId = request.PropertyId,
            Role = request.Role,
            ApartmentNumber = request.ApartmentNumber,
            Email = request.Email,
            Token = token,
            IsMultiUse = false,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
        });

        await db.SaveChangesAsync(cancellationToken);

        var joinLink = $"{request.AppBaseUrl.TrimEnd('/')}/join?token={token}";

        await emailService.SendPasswordSetupEmailAsync(request.Email, joinLink, cancellationToken);

        return request.Email;
    }
}
