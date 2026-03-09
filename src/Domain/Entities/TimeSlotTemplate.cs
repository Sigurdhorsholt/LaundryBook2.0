using Domain.Common;

namespace Domain.Entities;

public class TimeSlotTemplate : BaseEntity
{
    public Guid LaundryRoomId { get; set; }
    public LaundryRoom LaundryRoom { get; set; } = null!;

    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Booking> Bookings { get; set; } = [];
}
