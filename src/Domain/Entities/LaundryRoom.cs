using Domain.Common;

namespace Domain.Entities;

public class LaundryRoom : BaseEntity
{
    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<LaundryMachine> Machines { get; set; } = [];
    public ICollection<TimeSlotTemplate> TimeSlotTemplates { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}
