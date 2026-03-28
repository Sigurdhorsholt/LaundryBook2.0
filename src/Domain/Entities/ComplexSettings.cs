using Domain.Enums;

namespace Domain.Entities;

public class ComplexSettings
{
    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;

    public BookingMode BookingMode { get; set; } = BookingMode.BookSpecificMachine;
    public int CancellationWindowMinutes { get; set; } = 60;
    public int MaxConcurrentBookingsPerUser { get; set; } = 2;
    public int BookingLookaheadDays { get; set; } = 14;
    public BookingVisibility BookingVisibility { get; set; } = BookingVisibility.ApartmentOnly;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
