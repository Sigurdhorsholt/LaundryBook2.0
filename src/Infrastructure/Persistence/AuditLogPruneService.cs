using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence;

/// <summary>
/// Daily background job that deletes audit log entries older than the configured retention
/// window (Audit:RetentionDays, default 365). Uses a bulk delete so it does not itself get audited.
/// </summary>
public class AuditLogPruneService(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<AuditLogPruneService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var retentionDays = configuration.GetValue<int?>("Audit:RetentionDays") ?? 365;

        // Let startup (migrations, warm-up) settle before the first run.
        try { await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); }
        catch (OperationCanceledException) { return; }

        using var timer = new PeriodicTimer(Interval);
        while (!stoppingToken.IsCancellationRequested)
        {
            await PruneAsync(retentionDays, stoppingToken);
            try
            {
                if (!await timer.WaitForNextTickAsync(stoppingToken)) break;
            }
            catch (OperationCanceledException) { break; }
        }
    }

    private async Task PruneAsync(int retentionDays, CancellationToken cancellationToken)
    {
        try
        {
            var cutoff = DateTime.UtcNow.AddDays(-retentionDays);
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var deleted = await db.AuditLogs
                .Where(a => a.TimestampUtc < cutoff)
                .ExecuteDeleteAsync(cancellationToken);

            if (deleted > 0)
                logger.LogInformation(
                    "Pruned {Count} audit log entries older than {RetentionDays} days", deleted, retentionDays);
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            logger.LogError(ex, "Audit log prune failed");
        }
    }
}
