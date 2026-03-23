using Domain.Enums;

namespace Domain.Entities;

public class UserComplexMembership
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;

    public UserRole Role { get; set; }
    public string? ApartmentNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
