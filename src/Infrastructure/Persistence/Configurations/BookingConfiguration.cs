using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.HasKey(b => b.Id);

        builder.HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId);

        builder.HasOne(b => b.LaundryRoom)
            .WithMany(r => r.Bookings)
            .HasForeignKey(b => b.LaundryRoomId);

        builder.HasOne(b => b.TimeSlotTemplate)
            .WithMany(t => t.Bookings)
            .HasForeignKey(b => b.TimeSlotTemplateId);

        builder.HasOne(b => b.Machine)
            .WithMany(m => m.Bookings)
            .HasForeignKey(b => b.MachineId)
            .IsRequired(false);

        builder.Property(b => b.Status).IsRequired();
        builder.Property(b => b.Date).IsRequired();

        // Prevent double-booking: unique index per slot + machine + date (when machine is set)
        builder.HasIndex(b => new { b.TimeSlotTemplateId, b.MachineId, b.Date })
            .HasFilter("[MachineId] IS NOT NULL AND [Status] = 0");

        // Prevent double-booking entire room per slot + room + date
        builder.HasIndex(b => new { b.TimeSlotTemplateId, b.LaundryRoomId, b.Date });
    }
}
