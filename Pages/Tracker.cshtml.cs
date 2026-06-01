using System.Security.Claims;
using CSE499_FlowForge_Smart_Task_Productivity_System.Data;
using CSE499_FlowForge_Smart_Task_Productivity_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace CSE499_FlowForge_Smart_Task_Productivity_System.Pages;

[Authorize]
public class TrackerModel : PageModel
{
    private readonly ApplicationDbContext _context;

    public TrackerModel(ApplicationDbContext context)
    {
        _context = context;
    }

    public List<TaskItem> Tasks { get; set; } = new();

    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int PendingTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double CompletionRate { get; set; }

    public async Task OnGetAsync()
    {
        await LoadTasksAsync();
    }

    public async Task<IActionResult> OnPostAddTaskAsync([FromBody] AddTaskRequest request)
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest();
        }

        var task = new TaskItem
        {
            Title = request.Title,
            IsCompleted = false,
            Priority = string.IsNullOrWhiteSpace(request.Priority) ? "low" : request.Priority,
            DueDate = request.DueDate,
            UserId = userId
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return await GetUpdatedDataAsync();
    }

    public async Task<IActionResult> OnPostToggleTaskAsync([FromBody] TaskRequest request)
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var task = await _context.Tasks.FirstOrDefaultAsync(t =>
            t.Id == request.TaskId && t.UserId == userId
        );

        if (task == null)
        {
            return NotFound();
        }

        task.IsCompleted = !task.IsCompleted;
        await _context.SaveChangesAsync();

        return await GetUpdatedDataAsync();
    }

    public async Task<IActionResult> OnPostDeleteTaskAsync([FromBody] TaskRequest request)
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var task = await _context.Tasks.FirstOrDefaultAsync(t =>
            t.Id == request.TaskId && t.UserId == userId
        );

        if (task == null)
        {
            return NotFound();
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return await GetUpdatedDataAsync();
    }

    public async Task<IActionResult> OnPostGetWeeklyTasksAsync([FromBody] WeeklyRequest request)
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var startOfWeek = request.WeekStart.Date;
        var endOfWeek = startOfWeek.AddDays(6);

        var tasksInWeek = await _context
            .Tasks.Where(t =>
                t.UserId == userId && t.DueDate >= startOfWeek && t.DueDate <= endOfWeek
            )
            .OrderBy(t => t.DueDate)
            .ThenBy(t => t.Priority)
            .ToListAsync();

        var grouped = tasksInWeek
            .GroupBy(t => t.DueDate?.Date ?? DateTime.MinValue)
            .ToDictionary(
                g => g.Key,
                g =>
                    g.Select(t => new
                    {
                        t.Id,
                        t.Title,
                        t.Priority,
                        t.IsCompleted
                    })
            );

        var overloadedDays = grouped
            .Where(g => g.Value.Count() > 3)
            .Select(g => g.Key.ToString("yyyy-MM-dd"));

        return new JsonResult(
            new
            {
                weekStart = startOfWeek.ToString("yyyy-MM-dd"),
                weekEnd = endOfWeek.ToString("yyyy-MM-dd"),
                days = grouped,
                overloadedDays = overloadedDays
            }
        );
    }

    private async Task LoadTasksAsync()
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        Tasks = await _context
            .Tasks.Where(t => t.UserId == userId)
            .OrderBy(t => t.IsCompleted)
            .ThenBy(t => t.DueDate)
            .ToListAsync();

        DateTime today = DateTime.Today;

        TotalTasks = Tasks.Count;
        CompletedTasks = Tasks.Count(t => t.IsCompleted);
        PendingTasks = TotalTasks - CompletedTasks;
        OverdueTasks = Tasks.Count(t =>
            !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value.Date < today
        );

        CompletionRate = TotalTasks == 0 ? 0 : (double)CompletedTasks / TotalTasks * 100;
    }

    private async Task<JsonResult> GetUpdatedDataAsync()
    {
        await LoadTasksAsync();

        DateTime today = DateTime.Today;

        return new JsonResult(
            new
            {
                tasks = Tasks.Select(t => new
                {
                    id = t.Id,
                    title = t.Title,
                    isCompleted = t.IsCompleted,
                    priority = t.Priority,
                    dueDate = t.DueDate?.ToString("yyyy-MM-dd"),
                    isOverdue = !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value.Date < today
                }),
                stats = new
                {
                    total = TotalTasks,
                    completed = CompletedTasks,
                    pending = PendingTasks,
                    overdue = OverdueTasks,
                    completionRate = CompletionRate
                }
            }
        );
    }

    public class AddTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Priority { get; set; } = "low";
        public DateTime? DueDate { get; set; }
    }

    public class TaskRequest
    {
        public int TaskId { get; set; }
    }

    public class WeeklyRequest
    {
        public DateTime WeekStart { get; set; }
    }
}
