using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class UserComplexMembershipConfiguration : IEntityTypeConfiguration<UserComplexMembership>
{
    public void Configure(EntityTypeBuilder<UserComplexMembership> builder)
    {
        builder.HasKey(m => new { m.UserId, m.PropertyId });

        builder.HasOne(m => m.User)
            .WithMany(u => u.Memberships)
            .HasForeignKey(m => m.UserId);

        builder.HasOne(m => m.Property)
            .WithMany(p => p.Memberships)
            .HasForeignKey(m => m.PropertyId);

        builder.Property(m => m.ApartmentNumber).HasMaxLength(20);
        builder.Property(m => m.Role).IsRequired();
    }
}
