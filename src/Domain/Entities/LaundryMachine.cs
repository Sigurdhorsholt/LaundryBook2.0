using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class LaundryMachine : BaseEntity
{
    public Guid LaundryRoomId { get; set; }
    public LaundryRoom LaundryRoom { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public MachineType MachineType { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Booking> Bookings { get; set; } = [];
}
