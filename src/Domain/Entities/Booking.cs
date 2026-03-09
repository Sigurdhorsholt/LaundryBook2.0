using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class Booking : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid LaundryRoomId { get; set; }
    public LaundryRoom LaundryRoom { get; set; } = null!;

    public Guid TimeSlotTemplateId { get; set; }
    public TimeSlotTemplate TimeSlotTemplate { get; set; } = null!;

    // Null when BookingMode is BookEntireRoom
    public Guid? MachineId { get; set; }
    public LaundryMachine? Machine { get; set; }

    public DateOnly Date { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Active;
    public DateTime? CancelledAt { get; set; }
}
