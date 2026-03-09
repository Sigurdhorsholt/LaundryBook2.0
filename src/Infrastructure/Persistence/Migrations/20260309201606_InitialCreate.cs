using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Properties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Address = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Properties", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ExternalId = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ComplexSettings",
                columns: table => new
                {
                    PropertyId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BookingMode = table.Column<int>(type: "INTEGER", nullable: false),
                    CancellationWindowMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxConcurrentBookingsPerUser = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComplexSettings", x => x.PropertyId);
                    table.ForeignKey(
                        name: "FK_ComplexSettings_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LaundryRooms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PropertyId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaundryRooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LaundryRooms_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserComplexMemberships",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PropertyId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    ApartmentNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    JoinedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserComplexMemberships", x => new { x.UserId, x.PropertyId });
                    table.ForeignKey(
                        name: "FK_UserComplexMemberships_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserComplexMemberships_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LaundryMachines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LaundryRoomId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    MachineType = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaundryMachines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LaundryMachines_LaundryRooms_LaundryRoomId",
                        column: x => x.LaundryRoomId,
                        principalTable: "LaundryRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TimeSlotTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LaundryRoomId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "TEXT", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeSlotTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeSlotTemplates_LaundryRooms_LaundryRoomId",
                        column: x => x.LaundryRoomId,
                        principalTable: "LaundryRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    LaundryRoomId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TimeSlotTemplateId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MachineId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    CancelledAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_LaundryMachines_MachineId",
                        column: x => x.MachineId,
                        principalTable: "LaundryMachines",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Bookings_LaundryRooms_LaundryRoomId",
                        column: x => x.LaundryRoomId,
                        principalTable: "LaundryRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_TimeSlotTemplates_TimeSlotTemplateId",
                        column: x => x.TimeSlotTemplateId,
                        principalTable: "TimeSlotTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_LaundryRoomId",
                table: "Bookings",
                column: "LaundryRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_MachineId",
                table: "Bookings",
                column: "MachineId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TimeSlotTemplateId_LaundryRoomId_Date",
                table: "Bookings",
                columns: new[] { "TimeSlotTemplateId", "LaundryRoomId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TimeSlotTemplateId_MachineId_Date",
                table: "Bookings",
                columns: new[] { "TimeSlotTemplateId", "MachineId", "Date" },
                filter: "[MachineId] IS NOT NULL AND [Status] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserId",
                table: "Bookings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LaundryMachines_LaundryRoomId",
                table: "LaundryMachines",
                column: "LaundryRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_LaundryRooms_PropertyId",
                table: "LaundryRooms",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSlotTemplates_LaundryRoomId",
                table: "TimeSlotTemplates",
                column: "LaundryRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_UserComplexMemberships_PropertyId",
                table: "UserComplexMemberships",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ExternalId",
                table: "Users",
                column: "ExternalId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "ComplexSettings");

            migrationBuilder.DropTable(
                name: "UserComplexMemberships");

            migrationBuilder.DropTable(
                name: "LaundryMachines");

            migrationBuilder.DropTable(
                name: "TimeSlotTemplates");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "LaundryRooms");

            migrationBuilder.DropTable(
                name: "Properties");
        }
    }
}
