using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GovernmentCitizenServices.Api.Data;
using GovernmentCitizenServices.Api.Dtos;
using GovernmentCitizenServices.Api.Models;

namespace GovernmentCitizenServices.Api.Controllers
{
    [ApiController]
    [Route("api/services")]
    [Route("services")]
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ServicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> ListServices(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20,
            [FromQuery] string? search = null,
            [FromQuery] string? category = null)
        {
            var query = _context.GovernmentServices.Where(s => s.IsActive).AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(s => s.Category == category);
            }

            if (!string.IsNullOrEmpty(search))
            {
                var lower = search.ToLower();
                query = query.Where(s =>
                    s.Name.ToLower().Contains(lower) ||
                    s.Description.ToLower().Contains(lower) ||
                    s.Category.ToLower().Contains(lower));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderBy(s => s.Name)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return Ok(ApiResponse<PaginatedData<GovernmentService>>.Ok(new PaginatedData<GovernmentService>
            {
                Data = items,
                Total = total,
                Page = page,
                Limit = limit,
                TotalPages = (int)Math.Ceiling(total / (double)limit)
            }));
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.GovernmentServices
                .Where(s => s.IsActive)
                .Select(s => s.Category)
                .Distinct()
                .ToListAsync();

            return Ok(ApiResponse<List<string>>.Ok(categories));
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetServiceBySlug(string slug)
        {
            var service = await _context.GovernmentServices.FirstOrDefaultAsync(s => s.Slug == slug && s.IsActive);
            if (service == null) return NotFound(ApiResponse<string>.Fail("Service not found"));
            return Ok(ApiResponse<GovernmentService>.Ok(service));
        }
    }
}
