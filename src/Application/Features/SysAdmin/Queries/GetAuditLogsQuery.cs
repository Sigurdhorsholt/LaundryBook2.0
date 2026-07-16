using Application.Common.Authorization;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SysAdmin.Queries;

public record GetAuditLogsQuery(
    string? EntityType,
    Guid? UserId,
    string? Action,
    DateTime? From,
    DateTime? To,
    int Page,
    int PageSize) : IRequest<PagedAuditLogsResult>;

public record PagedAuditLogsResult(IReadOnlyList<AuditLogDto> Items, int TotalCount);

public record AuditLogDto(
    Guid Id,
    DateTime TimestampUtc,
    Guid? UserId,
    string? UserEmail,
    string Action,
    string EntityType,
    string EntityId,
    string? Changes);

public class GetAuditLogsQueryHandler(IAppDbContext db, PropertyAuthorizationService auth)
    : IRequestHandler<GetAuditLogsQuery, PagedAuditLogsResult>
{
    public async Task<PagedAuditLogsResult> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        if (!await auth.IsSysAdminAsync(cancellationToken))
            throw new ForbiddenException();

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = db.AuditLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.EntityType))
            query = query.Where(a => a.EntityType == request.EntityType);

        if (request.UserId is not null)
            query = query.Where(a => a.UserId == request.UserId);

        if (!string.IsNullOrWhiteSpace(request.Action))
            query = query.Where(a => a.Action == request.Action);

        if (request.From is not null)
            query = query.Where(a => a.TimestampUtc >= request.From);

        if (request.To is not null)
            query = query.Where(a => a.TimestampUtc <= request.To);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.TimestampUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto(
                a.Id,
                a.TimestampUtc,
                a.UserId,
                db.Users.Where(u => u.Id == a.UserId).Select(u => u.Email).FirstOrDefault(),
                a.Action,
                a.EntityType,
                a.EntityId,
                a.Changes))
            .ToListAsync(cancellationToken);

        return new PagedAuditLogsResult(items, totalCount);
    }
}
