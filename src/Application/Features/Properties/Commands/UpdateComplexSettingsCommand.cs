using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Time;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Commands;

public record UpdateComplexSettingsCommand(
    Guid PropertyId,
    BookingMode BookingMode,
    int CancellationWindowMinutes,
    int MaxConcurrentBookingsPerUser,
    int BookingLookaheadDays,
    BookingVisibility BookingVisibility) : IRequest;

public class UpdateComplexSettingsCommandValidator : AbstractValidator<UpdateComplexSettingsCommand>
{
    public UpdateComplexSettingsCommandValidator()
    {
        RuleFor(x => x.CancellationWindowMinutes).GreaterThanOrEqualTo(0).LessThanOrEqualTo(10080); // max 7 days
        // High ceilings only catch typos (e.g. 3650 days); real associations stay far below them
        RuleFor(x => x.MaxConcurrentBookingsPerUser).GreaterThan(0).LessThanOrEqualTo(100);
        RuleFor(x => x.BookingLookaheadDays).GreaterThan(0).LessThanOrEqualTo(365);
        RuleFor(x => x.BookingVisibility).IsInEnum();
        RuleFor(x => x.BookingMode).IsInEnum();
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

        // Existing bookings were made under the old mode's rules (whole-room bookings have no
        // machine; machine bookings share a slot), so switching with live bookings would let
        // slots be double-booked or show wrongly.
        if (request.BookingMode != settings.BookingMode)
        {
            var today = CopenhagenTime.Today;
            var upcoming = await db.Bookings.CountAsync(b =>
                b.LaundryRoom.PropertyId == request.PropertyId &&
                b.Date >= today &&
                b.Status == BookingStatus.Active,
                cancellationToken);

            if (upcoming > 0)
                throw new ConflictException(
                    $"Bookingtypen kan ikke ændres, mens der er {upcoming} kommende bookinger. Vent til de er afviklet, eller aflys dem først.");
        }

        settings.BookingMode = request.BookingMode;
        settings.CancellationWindowMinutes = request.CancellationWindowMinutes;
        settings.MaxConcurrentBookingsPerUser = request.MaxConcurrentBookingsPerUser;
        settings.BookingLookaheadDays = request.BookingLookaheadDays;
        settings.BookingVisibility = request.BookingVisibility;
        settings.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
    }
}
