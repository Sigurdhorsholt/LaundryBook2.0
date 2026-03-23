using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Queries;

public record GetInviteInfoQuery(string Token) : IRequest<InviteInfoDto>;

public record InviteInfoDto(UserRole Role, bool IsMultiUse, string? ApartmentNumber);

public class GetInviteInfoQueryHandler(IAppDbContext db) : IRequestHandler<GetInviteInfoQuery, InviteInfoDto>
{
    public async Task<InviteInfoDto> Handle(GetInviteInfoQuery request, CancellationToken cancellationToken)
    {
        var invite = await db.UserInvites
            .FirstOrDefaultAsync(
                i => i.Token == request.Token && !i.IsUsed && i.ExpiresAt > DateTime.UtcNow,
                cancellationToken)
            ?? throw new NotFoundException("UserInvite", request.Token);

        return new InviteInfoDto(invite.Role, invite.IsMultiUse, invite.ApartmentNumber);
    }
}
