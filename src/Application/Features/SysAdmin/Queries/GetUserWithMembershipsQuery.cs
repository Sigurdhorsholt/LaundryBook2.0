using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Time;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Queries;

public record GetUserWithMembershipsQuery(Guid UserId) : IRequest<SysAdminUserDetailDto>;

public record SysAdminUserDetailDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    DateTime CreatedAt,
    DateTime? LastSeenAt,
    DateTime? TermsAcceptedAt,
    UserActivityDto Activity,
    IReadOnlyList<UserPropertyMembershipDto> Memberships);

// Counted only when a SysAdmin opens the user, never for the whole list
public record UserActivityDto(
    int UpcomingBookings,
    int BookingsLast90Days,
    int TotalBookings,
    int LoggedChanges,
    DateTime? LastLoggedChangeAt);

public record UserPropertyMembershipDto(
    Guid PropertyId,
    string PropertyName,
    UserRole Role,
    string? ApartmentNumber,
    bool IsActive);

public class GetUserWithMembershipsQueryHandler(IAppDbContext db, PropertyAuthorizationService auth)
    : IRequestHandler<GetUserWithMembershipsQuery, SysAdminUserDetailDto>
{
    public async Task<SysAdminUserDetailDto> Handle(GetUserWithMembershipsQuery request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var user = await db.Users
            .Include(u => u.Memberships)
                .ThenInclude(m => m.Property)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), request.UserId);

        var today = CopenhagenTime.Today;
        var from = today.AddDays(-90);
        var bookings = db.Bookings.Where(b => b.UserId == user.Id && b.Status == BookingStatus.Active);
        var changes = db.AuditLogs.Where(a => a.UserId == user.Id);

        var activity = new UserActivityDto(
            await bookings.CountAsync(b => b.Date >= today, cancellationToken),
            await bookings.CountAsync(b => b.Date >= from && b.Date < today, cancellationToken),
            await bookings.CountAsync(cancellationToken),
            await changes.CountAsync(cancellationToken),
            await changes.MaxAsync(a => (DateTime?)a.TimestampUtc, cancellationToken));

        return new SysAdminUserDetailDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.CreatedAt,
            user.LastSeenAt,
            user.TermsAcceptedAt,
            activity,
            user.Memberships.Select(m => new UserPropertyMembershipDto(
                m.PropertyId,
                m.Property.Name,
                m.Role,
                m.ApartmentNumber,
                m.IsActive)).ToList());
    }
}
