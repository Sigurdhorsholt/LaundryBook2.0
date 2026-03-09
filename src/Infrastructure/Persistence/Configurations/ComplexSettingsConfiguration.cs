using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ComplexSettingsConfiguration : IEntityTypeConfiguration<ComplexSettings>
{
    public void Configure(EntityTypeBuilder<ComplexSettings> builder)
    {
        builder.HasKey(s => s.PropertyId);

        builder.HasOne(s => s.Property)
            .WithOne(p => p.Settings)
            .HasForeignKey<ComplexSettings>(s => s.PropertyId);

        builder.Property(s => s.BookingMode).IsRequired();
        builder.Property(s => s.CancellationWindowMinutes).IsRequired();
        builder.Property(s => s.MaxConcurrentBookingsPerUser).IsRequired();
    }
}
