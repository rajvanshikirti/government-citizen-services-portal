using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GovernmentCitizenServices.Api.Data;
using GovernmentCitizenServices.Api.Dtos;
using GovernmentCitizenServices.Api.Models;
using GovernmentCitizenServices.Api.Services;

namespace GovernmentCitizenServices.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> ListUsers([FromQuery] int page = 1, [FromQuery] int limit = 20, [FromQuery] string? search = null, [FromQuery] Role? role = null)
        {
            var query = _context.Users.Include(u => u.Applications).AsQueryable();

            if (role.HasValue) query = query.Where(u => u.Role == role.Value);

            if (!string.IsNullOrEmpty(search))
            {
                var lower = search.ToLower();
                query = query.Where(u =>
                    u.Email.ToLower().Contains(lower) ||
                    u.FirstName.ToLower().Contains(lower) ||
                    u.LastName.ToLower().Contains(lower));
            }

            var total = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var userDtos = users.Select(u => new
            {
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Phone,
                u.Role,
                u.IsActive,
                u.CreatedAt,
                _count = new { applications = u.Applications.Count }
            });

            return Ok(ApiResponse<PaginatedData<object>>.Ok(new PaginatedData<object>
            {
                Data = userDtos,
                Total = total,
                Page = page,
                Limit = limit,
                TotalPages = (int)Math.Ceiling(total / (double)limit)
            }));
        }

        [HttpPatch("users/{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(ApiResponse<string>.Fail("User not found"));

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { user.Id, user.Email, user.IsActive }));
        }
    }
}
