using Application.Common;
using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Time;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Queries;

public record GetSystemStatusQuery : IRequest<SystemStatusDto>;

public record SystemStatusDto(
    int ActiveProperties,
    int PendingProperties,
    int Users,
    int BookingsThisWeek,
    int PendingInvites,
    string Environment,
    bool EmailConfigured,
    bool FirebaseConfigured,
    bool ErrorTrackingConfigured,
    string? Commit,
    DateTime StartedAt);

public class GetSystemStatusQueryHandler(IAppDbContext db, PropertyAuthorizationService auth, SystemInfo info)
    : IRequestHandler<GetSystemStatusQuery, SystemStatusDto>
{
    public async Task<SystemStatusDto> Handle(GetSystemStatusQuery request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var today = CopenhagenTime.Today;
        var monday = today.AddDays(-(((int)today.DayOfWeek + 6) % 7));
        var nextMonday = monday.AddDays(7);
        var now = DateTime.UtcNow;

        var activeProperties = await db.Properties.CountAsync(p => p.IsActive, cancellationToken);
        var pendingProperties = await db.Properties.CountAsync(p => !p.IsActive, cancellationToken);
        var users = await db.Users.CountAsync(cancellationToken);
        var bookingsThisWeek = await db.Bookings.CountAsync(
            b => b.Status == BookingStatus.Active && b.Date >= monday && b.Date < nextMonday, cancellationToken);
        var pendingInvites = await db.UserInvites.CountAsync(
            i => !i.IsMultiUse && !i.IsUsed && i.ExpiresAt > now, cancellationToken);

        return new SystemStatusDto(
            activeProperties,
            pendingProperties,
            users,
            bookingsThisWeek,
            pendingInvites,
            info.Environment,
            info.EmailConfigured,
            info.FirebaseConfigured,
            info.ErrorTrackingConfigured,
            info.Commit,
            info.StartedAt);
    }
}
