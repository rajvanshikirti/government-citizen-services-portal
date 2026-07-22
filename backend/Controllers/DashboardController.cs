using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GovernmentCitizenServices.Api.Data;
using GovernmentCitizenServices.Api.Dtos;
using GovernmentCitizenServices.Api.Models;

namespace GovernmentCitizenServices.Api.Controllers
{
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        private (string userId, Role role) GetCurrentUserInfo()
        {
            var userId = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
            var roleStr = User.FindFirstValue("role") ?? User.FindFirstValue(ClaimTypes.Role) ?? "CITIZEN";
            Enum.TryParse<Role>(roleStr, out var role);
            return (userId, role);
        }

        [HttpGet("api/dashboard/stats")]
        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var (userId, role) = GetCurrentUserInfo();

            if (role == Role.CITIZEN)
            {
                var total = await _context.Applications.CountAsync(a => a.UserId == userId);
                var pending = await _context.Applications.CountAsync(a => a.UserId == userId && (a.Status == ApplicationStatus.SUBMITTED || a.Status == ApplicationStatus.UNDER_REVIEW));
                var approved = await _context.Applications.CountAsync(a => a.UserId == userId && (a.Status == ApplicationStatus.APPROVED || a.Status == ApplicationStatus.COMPLETED));
                var rejected = await _context.Applications.CountAsync(a => a.UserId == userId && a.Status == ApplicationStatus.REJECTED);

                return Ok(ApiResponse<object>.Ok(new { total, pending, approved, rejected }));
            }
            else
            {
                var totalUsers = await _context.Users.CountAsync();
                var totalApplications = await _context.Applications.CountAsync();
                var pendingApplications = await _context.Applications.CountAsync(a => a.Status == ApplicationStatus.SUBMITTED || a.Status == ApplicationStatus.UNDER_REVIEW);
                var completedApplications = await _context.Applications.CountAsync(a => a.Status == ApplicationStatus.APPROVED || a.Status == ApplicationStatus.COMPLETED);
                var servicesCount = await _context.GovernmentServices.CountAsync(s => s.IsActive);

                return Ok(ApiResponse<object>.Ok(new { totalUsers, totalApplications, pendingApplications, completedApplications, servicesCount }));
            }
        }

        [HttpGet("api/reports/by-service")]
        [HttpGet("reports/by-service")]
        [Authorize(Roles = "OFFICER,ADMIN")]
        public async Task<IActionResult> GetApplicationsByService()
        {
            var services = await _context.GovernmentServices
                .Where(s => s.IsActive)
                .Select(s => new
                {
                    service = s.Name,
                    count = s.Applications.Count
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(services));
        }

        [HttpGet("api/reports/by-status")]
        [HttpGet("reports/by-status")]
        [Authorize(Roles = "OFFICER,ADMIN")]
        public async Task<IActionResult> GetApplicationsByStatus()
        {
            var statusCounts = await _context.Applications
                .GroupBy(a => a.Status)
                .Select(g => new
                {
                    status = g.Key.ToString(),
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(statusCounts));
        }

        [HttpGet("api/reports/monthly-trend")]
        [HttpGet("reports/monthly-trend")]
        [Authorize(Roles = "OFFICER,ADMIN")]
        public async Task<IActionResult> GetMonthlyTrend([FromQuery] int months = 6)
        {
            var startDate = DateTime.UtcNow.AddMonths(-months);
            var apps = await _context.Applications
                .Where(a => a.CreatedAt >= startDate)
                .Select(a => a.CreatedAt)
                .ToListAsync();

            var monthly = apps
                .GroupBy(d => $"{d.Year}-{d.Month:D2}")
                .Select(g => new { month = g.Key, count = g.Count() })
                .OrderBy(x => x.month)
                .ToList();

            return Ok(ApiResponse<object>.Ok(monthly));
        }

        [HttpGet("api/notifications")]
        [HttpGet("notifications")]
        public async Task<IActionResult> ListNotifications([FromQuery] int page = 1, [FromQuery] int limit = 20, [FromQuery] bool unreadOnly = false)
        {
            var (userId, _) = GetCurrentUserInfo();
            var query = _context.Notifications.Where(n => n.UserId == userId).AsQueryable();

            if (unreadOnly) query = query.Where(n => !n.IsRead);

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return Ok(ApiResponse<PaginatedData<Notification>>.Ok(new PaginatedData<Notification>
            {
                Data = items,
                Total = total,
                Page = page,
                Limit = limit,
                TotalPages = (int)Math.Ceiling(total / (double)limit)
            }));
        }
    }
}
