using System.Text.Json;
using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Infrastructure.Persistence.Interceptors;

/// <summary>
/// Writes an <see cref="AuditLog"/> row for every created/updated/deleted entity in the same
/// transaction as the change. Covers all write actions (bookings, signups, invites, membership
/// and role changes, settings, activation, rooms/machines/timeslots) with no per-command wiring.
/// </summary>
public class AuditSaveChangesInterceptor(ICurrentUserService currentUser) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData, InterceptionResult<int> result)
    {
        if (eventData.Context is not null)
            AddAuditEntries(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
            AddAuditEntries(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void AddAuditEntries(DbContext context)
    {
        var userId = currentUser.UserId;
        var now = DateTime.UtcNow;

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.Entity is not AuditLog
                     && e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();

        var audits = entries.Select(entry => new AuditLog
        {
            TimestampUtc = now,
            UserId = userId,
            Action = entry.State switch
            {
                EntityState.Added => "Created",
                EntityState.Deleted => "Deleted",
                _ => "Updated",
            },
            EntityType = entry.Entity.GetType().Name,
            EntityId = GetPrimaryKey(entry),
            Changes = BuildChanges(entry),
        }).ToList();

        if (audits.Count > 0)
            context.Set<AuditLog>().AddRange(audits);
    }

    private static string GetPrimaryKey(EntityEntry entry)
    {
        var key = entry.Metadata.FindPrimaryKey();
        if (key is null)
            return string.Empty;

        var values = key.Properties.Select(p => entry.Property(p.Name).CurrentValue?.ToString() ?? "");
        return string.Join(",", values);
    }

    private static string? BuildChanges(EntityEntry entry)
    {
        var changes = new Dictionary<string, object?>();

        switch (entry.State)
        {
            case EntityState.Modified:
                foreach (var p in entry.Properties.Where(p => p.IsModified))
                    changes[p.Metadata.Name] = new { from = p.OriginalValue, to = p.CurrentValue };
                break;
            case EntityState.Added:
                foreach (var p in entry.Properties)
                    changes[p.Metadata.Name] = p.CurrentValue;
                break;
            case EntityState.Deleted:
                foreach (var p in entry.Properties)
                    changes[p.Metadata.Name] = p.OriginalValue;
                break;
        }

        return changes.Count == 0 ? null : JsonSerializer.Serialize(changes);
    }
}
