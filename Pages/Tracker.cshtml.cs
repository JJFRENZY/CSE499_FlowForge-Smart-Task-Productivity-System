using System.Security.Claims;
using CSE499_FlowForge_Smart_Task_Productivity_System.Data;
using CSE499_FlowForge_Smart_Task_Productivity_System.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace CSE499_FlowForge_Smart_Task_Productivity_System.Pages
{
    [Authorize]
    public class TrackerModel : PageModel
    {
        private readonly ApplicationDbContext _db;

        public TrackerModel(ApplicationDbContext db)
        {
            _db = db;
        }

        // Data for initial page load
        public List<TaskItem> Tasks { get; set; } = new();
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
        public double CompletionRate { get; set; }

        public async Task OnGetAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await LoadDashboardDataAsync(userId);
        }

        // ---- AJAX Handlers ----


        public async Task<IActionResult> OnPostAddTask([FromBody] AddTaskRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest("Title required");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var task = new TaskItem
            {
                Title = request.Title.Trim(),
                IsCompleted = false,
                UserId = userId
            };
            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();

            return await GetUpdatedDashboardDataAsync(userId);
        }

        public async Task<IActionResult> OnPostDeleteTask([FromBody] DeleteTaskRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var task = await _db.Tasks.FirstOrDefaultAsync(t =>
                t.Id == request.TaskId && t.UserId == userId
            );
            if (task != null)
            {
                _db.Tasks.Remove(task);
                await _db.SaveChangesAsync();
            }
            return await GetUpdatedDashboardDataAsync(userId);
        }

        public async Task<IActionResult> OnPostToggleTask([FromBody] ToggleTaskRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var task = await _db.Tasks.FirstOrDefaultAsync(t =>
                t.Id == request.TaskId && t.UserId == userId
            );
            if (task != null)
            {
                task.IsCompleted = !task.IsCompleted;
                await _db.SaveChangesAsync();
            }
            return await GetUpdatedDashboardDataAsync(userId);
        }

        // Helper: load tasks + stats for current user and return JSON
        private async Task<IActionResult> GetUpdatedDashboardDataAsync(string userId)
        {
            var tasks = await _db
                .Tasks.Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var total = tasks.Count;
            var completed = tasks.Count(t => t.IsCompleted);
            var pending = total - completed;
            var rate = total == 0 ? 0 : (double)completed / total * 100;

            return new JsonResult(
                new
                {
                    tasks = tasks.Select(t => new
                    {
                        t.Id,
                        t.Title,
                        t.IsCompleted
                    }),
                    stats = new
                    {
                        total,
                        completed,
                        pending,
                        completionRate = rate
                    }
                }
            );
        }

        private async Task LoadDashboardDataAsync(string userId)
        {
            var data = await GetUpdatedDashboardDataAsync(userId) as JsonResult;
            var obj = data?.Value as dynamic;
            if (obj != null)
            {
                var tasksEnumerable =
                    obj.tasks as IEnumerable<dynamic> ?? Enumerable.Empty<dynamic>();
                Tasks = tasksEnumerable
                    .Select(t => new TaskItem
                    {
                        Id = t.Id,
                        Title = t.Title,
                        IsCompleted = t.IsCompleted
                    })
                    .ToList();
                TotalTasks = obj.stats.total;
                CompletedTasks = obj.stats.completed;
                PendingTasks = obj.stats.pending;
                CompletionRate = obj.stats.completionRate;
            }
        }
    }

    // Request DTOs
    public class AddTaskRequest
    {
        public string Title { get; set; } = "";
    }

    public class DeleteTaskRequest
    {
        public int TaskId { get; set; }
    }

    public class ToggleTaskRequest
    {
        public int TaskId { get; set; }
    }
}
