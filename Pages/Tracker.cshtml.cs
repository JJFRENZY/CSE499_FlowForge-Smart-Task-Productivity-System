using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

[Authorize]
public class TrackerModel : PageModel
{
    public void OnGet() { }
}
