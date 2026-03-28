using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Queries;

public record GetAllUsersQuery(string? Search, int Page, int PageSize) : IRequest<PagedUsersResult>;

public record PagedUsersResult(IReadOnlyList<SysAdminUserDto> Items, int TotalCount);

public record SysAdminUserDto(Guid Id, string Email, string FirstName, string LastName, int MembershipCount);

public class GetAllUsersQueryHandler(IAppDbContext db, PropertyAuthorizationService auth)
    : IRequestHandler<GetAllUsersQuery, PagedUsersResult>
{
    public async Task<PagedUsersResult> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var query = db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(search) ||
                u.FirstName.ToLower().Contains(search) ||
                u.LastName.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .OrderBy(u => u.LastName).ThenBy(u => u.FirstName)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new SysAdminUserDto(
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Memberships.Count))
            .ToListAsync(cancellationToken);

        return new PagedUsersResult(users, totalCount);
    }
}
