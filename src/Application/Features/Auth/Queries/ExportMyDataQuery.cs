using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Queries;

public record ExportMyDataQuery : IRequest<MyDataExportDto>;

public record MyDataExportDto(
    DateTime ExportedAt,
    MyProfileExportDto Profile,
    IReadOnlyList<MyMembershipExportDto> Memberships,
    IReadOnlyList<MyBookingExportDto> Bookings);

public record MyProfileExportDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    DateTime CreatedAt,
    DateTime? TermsAcceptedAt,
    string? TermsVersion);

public record MyMembershipExportDto(
    string PropertyName,
    string PropertyAddress,
    UserRole Role,
    string? ApartmentNumber,
    bool IsActive,
    DateTime JoinedAt);

public record MyBookingExportDto(
    DateOnly Date,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string PropertyName,
    string RoomName,
    string? MachineName,
    BookingStatus Status,
    DateTime CreatedAt,
    DateTime? CancelledAt);

// Everything stored about the signed-in user, for the "download my data" right (GDPR art. 15/20)
public class ExportMyDataQueryHandler(
    IAppDbContext db,
    ICurrentUserService currentUser) : IRequestHandler<ExportMyDataQuery, MyDataExportDto>
{
    public async Task<MyDataExportDto> Handle(ExportMyDataQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new ForbiddenException("Du skal være logget ind.", ErrorCodes.NotSignedIn);

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), userId);

        var memberships = await db.UserComplexMemberships
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.JoinedAt)
            .Select(m => new MyMembershipExportDto(m.Property.Name, m.Property.Address, m.Role, m.ApartmentNumber, m.IsActive, m.JoinedAt))
            .ToListAsync(cancellationToken);

        var bookings = await db.Bookings
            .Where(b => b.UserId == userId)
            .OrderBy(b => b.Date).ThenBy(b => b.TimeSlotTemplate.StartTime)
            .Select(b => new MyBookingExportDto(
                b.Date,
                b.TimeSlotTemplate.StartTime,
                b.TimeSlotTemplate.EndTime,
                b.LaundryRoom.Property.Name,
                b.LaundryRoom.Name,
                b.Machine != null ? b.Machine.Name : null,
                b.Status,
                b.CreatedAt,
                b.CancelledAt))
            .ToListAsync(cancellationToken);

        return new MyDataExportDto(
            DateTime.UtcNow,
            new MyProfileExportDto(user.Id, user.Email, user.FirstName, user.LastName, user.CreatedAt, user.TermsAcceptedAt, user.TermsVersion),
            memberships,
            bookings);
    }
}
