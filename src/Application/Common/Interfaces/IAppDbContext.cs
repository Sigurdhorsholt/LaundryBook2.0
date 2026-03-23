using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Property> Properties { get; }
    DbSet<UserComplexMembership> UserComplexMemberships { get; }
    DbSet<ComplexSettings> ComplexSettings { get; }
    DbSet<LaundryRoom> LaundryRooms { get; }
    DbSet<LaundryMachine> LaundryMachines { get; }
    DbSet<TimeSlotTemplate> TimeSlotTemplates { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<UserInvite> UserInvites { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
