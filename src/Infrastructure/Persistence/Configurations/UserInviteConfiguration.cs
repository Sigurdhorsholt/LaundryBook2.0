using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class UserInviteConfiguration : IEntityTypeConfiguration<UserInvite>
{
    public void Configure(EntityTypeBuilder<UserInvite> builder)
    {
        builder.HasKey(i => i.Id);
        builder.HasIndex(i => i.Token).IsUnique();
        builder.Property(i => i.Token).IsRequired().HasMaxLength(64);
        builder.Property(i => i.ApartmentNumber).HasMaxLength(20);

        builder.HasOne(i => i.Property)
            .WithMany()
            .HasForeignKey(i => i.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
