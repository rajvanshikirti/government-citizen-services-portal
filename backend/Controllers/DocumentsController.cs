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
    [Route("api/documents")]
    [Route("documents")]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public DocumentsController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private (string userId, Role role) GetCurrentUserInfo()
        {
            var userId = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
            var roleStr = User.FindFirstValue("role") ?? User.FindFirstValue(ClaimTypes.Role) ?? "CITIZEN";
            Enum.TryParse<Role>(roleStr, out var role);
            return (userId, role);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument(IFormFile file, [FromForm] string? applicationId = null)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<string>.Fail("No file uploaded"));
            }

            var (userId, _) = GetCurrentUserInfo();
            var uploadDir = _configuration["UploadSettings:UploadDirectory"] ?? "./uploads";
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            var fileExt = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExt}";
            var filePath = Path.Combine(uploadDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var doc = new Document
            {
                UserId = userId,
                ApplicationId = applicationId,
                FileName = uniqueFileName,
                OriginalName = file.FileName,
                MimeType = file.ContentType,
                FileSize = (int)file.Length,
                FilePath = filePath,
                IsVerified = false
            };

            await _context.Documents.AddAsync(doc);
            await _context.SaveChangesAsync();

            var dto = new DocumentDto
            {
                Id = doc.Id,
                ApplicationId = doc.ApplicationId,
                UserId = doc.UserId,
                FileName = doc.FileName,
                OriginalName = doc.OriginalName,
                MimeType = doc.MimeType,
                FileSize = doc.FileSize,
                FilePath = doc.FilePath,
                IsVerified = doc.IsVerified,
                CreatedAt = doc.CreatedAt
            };

            return StatusCode(201, ApiResponse<DocumentDto>.Ok(dto));
        }

        [HttpGet("{id}/view")]
        public async Task<IActionResult> ViewDocument(string id)
        {
            var (userId, role) = GetCurrentUserInfo();
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound(ApiResponse<string>.Fail("Document not found"));

            if (role == Role.CITIZEN && doc.UserId != userId)
            {
                return StatusCode(403, ApiResponse<string>.Fail("Forbidden"));
            }

            if (!System.IO.File.Exists(doc.FilePath))
            {
                return NotFound(ApiResponse<string>.Fail("Document file not found on server"));
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(doc.FilePath);
            return File(fileBytes, doc.MimeType, doc.OriginalName);
        }

        [HttpPatch("{id}/verify")]
        [Authorize(Roles = "OFFICER,ADMIN")]
        public async Task<IActionResult> VerifyDocument(string id)
        {
            var (officerId, _) = GetCurrentUserInfo();
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound(ApiResponse<string>.Fail("Document not found"));

            doc.IsVerified = true;
            doc.VerifiedBy = officerId;
            doc.VerifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var dto = new DocumentDto
            {
                Id = doc.Id,
                ApplicationId = doc.ApplicationId,
                UserId = doc.UserId,
                FileName = doc.FileName,
                OriginalName = doc.OriginalName,
                MimeType = doc.MimeType,
                FileSize = doc.FileSize,
                FilePath = doc.FilePath,
                IsVerified = doc.IsVerified,
                VerifiedBy = doc.VerifiedBy,
                VerifiedAt = doc.VerifiedAt,
                CreatedAt = doc.CreatedAt
            };

            return Ok(ApiResponse<DocumentDto>.Ok(dto, "Document verified successfully"));
        }
    }
}
