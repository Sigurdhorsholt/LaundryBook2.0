using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyDpaAcceptance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DpaAcceptedAt",
                table: "Properties",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DpaAcceptedByUserId",
                table: "Properties",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DpaVersion",
                table: "Properties",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DpaAcceptedAt",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "DpaAcceptedByUserId",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "DpaVersion",
                table: "Properties");
        }
    }
}
