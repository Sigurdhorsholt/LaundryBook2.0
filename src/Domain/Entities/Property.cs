using Domain.Common;

namespace Domain.Entities;

public class Property : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    // Self-service signups create the property inactive; a SysAdmin activates it.
    // SysAdmin-created properties default to active.
    public bool IsActive { get; set; } = true;

    // The board's house and laundry rules as Markdown-lite text; residents see them on the property page
    public string? HouseRules { get; set; }
    public DateTime? HouseRulesUpdatedAt { get; set; }

    // Proof that the association agreed to the data processing agreement (GDPR art. 28): who
    // accepted it on its behalf, when, and which version. Empty for SysAdmin-created properties.
    public DateTime? DpaAcceptedAt { get; set; }
    public Guid? DpaAcceptedByUserId { get; set; }
    public string? DpaVersion { get; set; }

    public ComplexSettings? Settings { get; set; }
    public ICollection<UserComplexMembership> Memberships { get; set; } = [];
    public ICollection<LaundryRoom> LaundryRooms { get; set; } = [];
}
