using Application.Common.Interfaces;
using Application.Features.Auth.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Queries;

public record GetCurrentUserQuery : IRequest<CurrentUserDto>;

public class GetCurrentUserQueryHandler(
    ICurrentUserService currentUser,
    IAppDbContext db) : IRequestHandler<GetCurrentUserQuery, CurrentUserDto>
{
    public async Task<CurrentUserDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var user = await db.Users
            .Include(u => u.Memberships)
                .ThenInclude(m => m.Property)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not found.");

        return new CurrentUserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Memberships.Select(m => new UserComplexMembershipDto(
                m.PropertyId,
                m.Property.Name,
                m.Role,
                m.ApartmentNumber)).ToList());
    }
}
