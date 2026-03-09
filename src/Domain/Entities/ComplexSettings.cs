using Domain.Enums;

namespace Domain.Entities;

public class ComplexSettings
{
    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;

    public BookingMode BookingMode { get; set; } = BookingMode.BookSpecificMachine;
    public int CancellationWindowMinutes { get; set; } = 60;
    public int MaxConcurrentBookingsPerUser { get; set; } = 2;
}
