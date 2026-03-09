using Domain.Common;

namespace Domain.Entities;

public class Property : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public ComplexSettings? Settings { get; set; }
    public ICollection<UserComplexMembership> Memberships { get; set; } = [];
    public ICollection<LaundryRoom> LaundryRooms { get; set; } = [];
}
