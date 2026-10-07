using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record UpdateHouseRulesCommand(Guid PropertyId, string? Text) : IRequest;

public class UpdateHouseRulesCommandValidator : AbstractValidator<UpdateHouseRulesCommand>
{
    public const int MaxLength = 10_000;

    public UpdateHouseRulesCommandValidator()
    {
        RuleFor(x => x.Text).MaximumLength(MaxLength);
    }
}

public class UpdateHouseRulesCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<UpdateHouseRulesCommand>
{
    public async Task Handle(UpdateHouseRulesCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var property = await db.Properties
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Property), request.PropertyId);

        // Blank text means "no rules": residents then see nothing instead of an empty section
        var text = string.IsNullOrWhiteSpace(request.Text) ? null : request.Text.Trim();
        if (text == property.HouseRules) return;

        property.HouseRules = text;
        property.HouseRulesUpdatedAt = text is null ? null : DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
    }
}
