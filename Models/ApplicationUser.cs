using Microsoft.AspNetCore.Identity;

namespace CSE499_FlowForge_Smart_Task_Productivity_System.Models // or .Data, but keep consistent
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName { get; set; }
    }
}
