using Domain.Common;

namespace Domain.Entities;

public class User : BaseEntity
{
    public string ExternalId { get; set; } = string.Empty; // IDP UID (e.g. Firebase UID)
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    // Recorded consent to the terms + privacy policy at signup/invite-redeem.
    public DateTime? TermsAcceptedAt { get; set; }
    public string? TermsVersion { get; set; }

    public ICollection<UserComplexMembership> Memberships { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}
