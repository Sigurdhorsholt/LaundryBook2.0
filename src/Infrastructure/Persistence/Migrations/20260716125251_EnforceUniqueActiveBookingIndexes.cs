using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnforceUniqueActiveBookingIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_TimeSlotTemplateId_LaundryRoomId_Date",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_TimeSlotTemplateId_MachineId_Date",
                table: "Bookings");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TimeSlotTemplateId_LaundryRoomId_Date",
                table: "Bookings",
                columns: new[] { "TimeSlotTemplateId", "LaundryRoomId", "Date" },
                unique: true,
                filter: "\"MachineId\" IS NULL AND \"Status\" = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TimeSlotTemplateId_MachineId_Date",
                table: "Bookings",
                columns: new[] { "TimeSlotTemplateId", "MachineId", "Date" },
                unique: true,
                filter: "\"MachineId\" IS NOT NULL AND \"Status\" = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_TimeSlotTemplateId_LaundryRoomId_Date",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_TimeSlotTemplateId_MachineId_Date",
                table: "Bookings");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TimeSlotTemplateId_LaundryRoomId_Date",
                table: "Bookings",
                columns: new[] { "TimeSlotTemplateId", "LaundryRoomId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TimeSlotTemplateId_MachineId_Date",
                table: "Bookings",
                columns: new[] { "TimeSlotTemplateId", "MachineId", "Date" },
                filter: "\"MachineId\" IS NOT NULL AND \"Status\" = 0");
        }
    }
}
