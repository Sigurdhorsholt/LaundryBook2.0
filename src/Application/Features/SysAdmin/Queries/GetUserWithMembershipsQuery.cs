using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
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
    IReadOnlyList<UserPropertyMembershipDto> Memberships);

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

        return new SysAdminUserDetailDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Memberships.Select(m => new UserPropertyMembershipDto(
                m.PropertyId,
                m.Property.Name,
                m.Role,
                m.ApartmentNumber,
                m.IsActive)).ToList());
    }
}
