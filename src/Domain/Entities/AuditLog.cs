namespace Domain.Entities;

/// <summary>
/// Append-only record of a create/update/delete on any tracked entity, written automatically
/// by the audit SaveChanges interceptor.
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    /// <summary>Acting user (from the JWT); null for unauthenticated actions like initial signup.</summary>
    public Guid? UserId { get; set; }

    /// <summary>Created | Updated | Deleted.</summary>
    public string Action { get; set; } = default!;

    public string EntityType { get; set; } = default!;
    public string EntityId { get; set; } = default!;

    /// <summary>JSON: changed fields (from/to) for updates, or a value snapshot for creates/deletes.</summary>
    public string? Changes { get; set; }
}
