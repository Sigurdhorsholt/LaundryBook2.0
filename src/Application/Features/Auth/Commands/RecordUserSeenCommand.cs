using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Auth.Commands;

public record RecordUserSeenCommand : IRequest;

// "Last active" for /system, set when the app loads. One conditional UPDATE at most every 15 minutes per
// user: no read, and it bypasses the audit interceptor, which would otherwise log a change on every load.
public class RecordUserSeenCommandHandler(IAppDbContext db, ICurrentUserService currentUser) : IRequestHandler<RecordUserSeenCommand>
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(15);

    public async Task Handle(RecordUserSeenCommand request, CancellationToken cancellationToken)
    {
        if (currentUser.UserId is not { } userId)
            return;

        var now = DateTime.UtcNow;
        var cutoff = now - Interval;
        await db.Users
            .Where(u => u.Id == userId && (u.LastSeenAt == null || u.LastSeenAt < cutoff))
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.LastSeenAt, now), cancellationToken);
    }
}
