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

    public ComplexSettings? Settings { get; set; }
    public ICollection<UserComplexMembership> Memberships { get; set; } = [];
    public ICollection<LaundryRoom> LaundryRooms { get; set; } = [];
}
