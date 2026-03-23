using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.Properties.Commands;

public record CreateInviteTokenCommand(
    Guid PropertyId,
    UserRole Role,
    string? ApartmentNumber,
    bool IsMultiUse = false) : IRequest<string>;

public class CreateInviteTokenCommandValidator : AbstractValidator<CreateInviteTokenCommand>
{
    public CreateInviteTokenCommandValidator()
    {
        RuleFor(x => x.Role).IsInEnum()
            .NotEqual(UserRole.SysAdmin).WithMessage("Cannot create a SysAdmin invite.");
        RuleFor(x => x.ApartmentNumber).MaximumLength(20).When(x => x.ApartmentNumber is not null);
    }
}

public class CreateInviteTokenCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<CreateInviteTokenCommand, string>
{
    public async Task<string> Handle(CreateInviteTokenCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var token = Guid.NewGuid().ToString("N"); // 32-char hex, URL-safe

        db.UserInvites.Add(new UserInvite
        {
            PropertyId = request.PropertyId,
            Role = request.Role,
            ApartmentNumber = request.ApartmentNumber,
            Token = token,
            IsMultiUse = request.IsMultiUse,
            ExpiresAt = request.IsMultiUse
                ? DateTime.UtcNow.AddYears(1)
                : DateTime.UtcNow.AddDays(7),
        });

        await db.SaveChangesAsync(cancellationToken);
        return token;
    }
}
