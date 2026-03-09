using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<UserComplexMembership> UserComplexMemberships => Set<UserComplexMembership>();
    public DbSet<ComplexSettings> ComplexSettings => Set<ComplexSettings>();
    public DbSet<LaundryRoom> LaundryRooms => Set<LaundryRoom>();
    public DbSet<LaundryMachine> LaundryMachines => Set<LaundryMachine>();
    public DbSet<TimeSlotTemplate> TimeSlotTemplates => Set<TimeSlotTemplate>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
