using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record UpdateComplexSettingsCommand(
    Guid PropertyId,
    BookingMode BookingMode,
    int CancellationWindowMinutes,
    int MaxConcurrentBookingsPerUser) : IRequest;

public class UpdateComplexSettingsCommandValidator : AbstractValidator<UpdateComplexSettingsCommand>
{
    public UpdateComplexSettingsCommandValidator()
    {
        RuleFor(x => x.CancellationWindowMinutes).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxConcurrentBookingsPerUser).GreaterThan(0).LessThanOrEqualTo(10);
    }
}

public class UpdateComplexSettingsCommandHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<UpdateComplexSettingsCommand>
{
    public async Task Handle(UpdateComplexSettingsCommand request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        var settings = await db.ComplexSettings
            .FirstOrDefaultAsync(s => s.PropertyId == request.PropertyId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.ComplexSettings), request.PropertyId);

        settings.BookingMode = request.BookingMode;
        settings.CancellationWindowMinutes = request.CancellationWindowMinutes;
        settings.MaxConcurrentBookingsPerUser = request.MaxConcurrentBookingsPerUser;

        await db.SaveChangesAsync(cancellationToken);
    }
}
