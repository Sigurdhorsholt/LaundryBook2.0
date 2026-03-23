using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class UserInvite : BaseEntity
{
    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;

    public UserRole Role { get; set; }
    public string? ApartmentNumber { get; set; }

    /// <summary>URL-safe token included in the QR code link.</summary>
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }

    /// <summary>
    /// When true the token can be redeemed many times (e.g. printed QR in hallway).
    /// IsUsed is never set to true for multi-use invites.
    /// The user supplies their own ApartmentNumber at redemption time.
    /// </summary>
    public bool IsMultiUse { get; set; }
}
