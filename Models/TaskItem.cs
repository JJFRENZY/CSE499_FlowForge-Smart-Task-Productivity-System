using System.ComponentModel.DataAnnotations;

namespace CSE499_FlowForge_Smart_Task_Productivity_System.Models;

public class TaskItem
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public string Priority { get; set; } = "low";

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public string? UserId { get; set; }
    public string Category { get; set; } = "other";
}
