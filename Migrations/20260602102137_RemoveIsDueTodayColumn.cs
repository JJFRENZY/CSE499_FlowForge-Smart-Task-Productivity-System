using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSE499_FlowForge_Smart_Task_Productivity_System.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIsDueTodayColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Tasks",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Tasks");
        }
    }
}
