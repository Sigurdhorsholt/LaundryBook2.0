using Domain.Common;

namespace Domain.Entities;

public class User : BaseEntity
{
    public string ExternalId { get; set; } = string.Empty; // IDP UID (e.g. Firebase UID)
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public ICollection<UserComplexMembership> Memberships { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}
