using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Bookings.Commands;

public record AcknowledgeCancellationNoticesCommand(IReadOnlyList<Guid> BookingIds) : IRequest;

public class AcknowledgeCancellationNoticesCommandValidator : AbstractValidator<AcknowledgeCancellationNoticesCommand>
{
    public AcknowledgeCancellationNoticesCommandValidator()
    {
        RuleFor(x => x.BookingIds).NotNull().Must(ids => ids.Count <= 200);
    }
}

public class AcknowledgeCancellationNoticesCommandHandler(
    IAppDbContext db,
    ICurrentUserService currentUser) : IRequestHandler<AcknowledgeCancellationNoticesCommand>
{
    public async Task Handle(AcknowledgeCancellationNoticesCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new ForbiddenException("Du skal være logget ind.", ErrorCodes.NotSignedIn);

        // Scoped to the caller's own bookings, so ids of someone else's bookings are simply ignored
        var bookings = await db.Bookings
            .Where(b => request.BookingIds.Contains(b.Id) &&
                        b.UserId == userId &&
                        b.Status == BookingStatus.CancelledByAdmin &&
                        b.CancellationSeenAt == null)
            .ToListAsync(cancellationToken);
        if (bookings.Count == 0) return;

        var now = DateTime.UtcNow;
        foreach (var b in bookings) b.CancellationSeenAt = now;
        await db.SaveChangesAsync(cancellationToken);
    }
}
