using Application.Common.Authorization;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Properties.Queries;

public record GetPropertyMembersQuery(Guid PropertyId) : IRequest<IReadOnlyList<PropertyMemberDto>>;

public record PropertyMemberDto(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string? ApartmentNumber,
    UserRole Role,
    bool IsActive,
    DateTime JoinedAt);

public class GetPropertyMembersQueryHandler(
    IAppDbContext db,
    PropertyAuthorizationService auth) : IRequestHandler<GetPropertyMembersQuery, IReadOnlyList<PropertyMemberDto>>
{
    public async Task<IReadOnlyList<PropertyMemberDto>> Handle(GetPropertyMembersQuery request, CancellationToken cancellationToken)
    {
        await auth.RequireRoleAsync(request.PropertyId, UserRole.ComplexAdmin, cancellationToken);

        return await db.UserComplexMemberships
            .Where(m => m.PropertyId == request.PropertyId)
            .Include(m => m.User)
            .OrderBy(m => m.ApartmentNumber)
            .ThenBy(m => m.User.LastName)
            .Select(m => new PropertyMemberDto(
                m.UserId,
                m.User.Email,
                m.User.FirstName,
                m.User.LastName,
                m.ApartmentNumber,
                m.Role,
                m.IsActive,
                m.JoinedAt))
            .ToListAsync(cancellationToken);
    }
}
