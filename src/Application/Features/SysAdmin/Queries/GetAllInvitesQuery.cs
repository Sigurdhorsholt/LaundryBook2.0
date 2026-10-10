using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Queries;

public enum SystemInviteStatus
{
    Pending,
    Expired,
    SharedLink,
}

public record GetAllInvitesQuery(SystemInviteStatus Status) : IRequest<IReadOnlyList<SystemInviteDto>>;

public record SystemInviteDto(
    Guid Id,
    Guid PropertyId,
    string PropertyName,
    string? Email,
    string? ApartmentNumber,
    UserRole Role,
    bool IsMultiUse,
    DateTime CreatedAt,
    DateTime ExpiresAt,
    string? CreatedBy);

// Unused invites on every property. Used ones (accepted, or replaced by a resend) are left out.
public class GetAllInvitesQueryHandler(IAppDbContext db, PropertyAuthorizationService auth)
    : IRequestHandler<GetAllInvitesQuery, IReadOnlyList<SystemInviteDto>>
{
    public async Task<IReadOnlyList<SystemInviteDto>> Handle(GetAllInvitesQuery request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var now = DateTime.UtcNow;
        var query = request.Status switch
        {
            SystemInviteStatus.Pending => db.UserInvites.Where(i => !i.IsMultiUse && !i.IsUsed && i.ExpiresAt > now),
            SystemInviteStatus.Expired => db.UserInvites.Where(i => !i.IsMultiUse && !i.IsUsed && i.ExpiresAt <= now),
            // Revoking a shared link expires it, so only the current ones are listed
            _ => db.UserInvites.Where(i => i.IsMultiUse && i.ExpiresAt > now),
        };

        var invites = await query
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new { Invite = i, PropertyName = i.Property.Name })
            .ToListAsync(cancellationToken);

        var creators = await CreatorsAsync(invites.Select(x => x.Invite.Id.ToString()).ToList(), cancellationToken);

        return invites
            .Select(x => new SystemInviteDto(
                x.Invite.Id,
                x.Invite.PropertyId,
                x.PropertyName,
                x.Invite.Email,
                x.Invite.ApartmentNumber,
                x.Invite.Role,
                x.Invite.IsMultiUse,
                x.Invite.CreatedAt,
                x.Invite.ExpiresAt,
                creators.GetValueOrDefault(x.Invite.Id.ToString())))
            .ToList();
    }

    // Invites don't store who made them; the audit log does, until it is pruned
    private async Task<Dictionary<string, string>> CreatorsAsync(List<string> inviteIds, CancellationToken cancellationToken)
    {
        var rows = await db.AuditLogs
            .Where(a => a.EntityType == nameof(UserInvite) && a.Action == "Created" && inviteIds.Contains(a.EntityId))
            .Join(db.Users, a => a.UserId, u => (Guid?)u.Id, (a, u) => new { a.EntityId, u.FirstName, u.LastName, u.Email })
            .ToListAsync(cancellationToken);

        return rows
            .GroupBy(r => r.EntityId)
            .ToDictionary(g => g.Key, g =>
            {
                var r = g.First();
                var name = $"{r.FirstName} {r.LastName}".Trim();
                return name.Length > 0 ? name : r.Email;
            });
    }
}
