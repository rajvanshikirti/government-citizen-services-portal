using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GovernmentCitizenServices.Api.Dtos;
using GovernmentCitizenServices.Api.Models;
using GovernmentCitizenServices.Api.Services;

namespace GovernmentCitizenServices.Api.Controllers
{
    [ApiController]
    [Route("api/applications")]
    public class ApplicationsController : ControllerBase
    {
        private readonly ApplicationService _applicationService;

        public ApplicationsController(ApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        private (string userId, Role role) GetCurrentUserInfo()
        {
            var userId = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
            var roleStr = User.FindFirstValue("role") ?? User.FindFirstValue(ClaimTypes.Role) ?? "CITIZEN";
            Enum.TryParse<Role>(roleStr, out var role);
            return (userId, role);
        }

        [HttpGet("verify/{certificateNo}")]
        public async Task<IActionResult> VerifyCertificate(string certificateNo)
        {
            try
            {
                var result = await _applicationService.VerifyCertificateAsync(certificateNo);
                return Ok(ApiResponse<VerifyCertificateResultDto>.Ok(result));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> ListApplications(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? search = null,
            [FromQuery] ApplicationStatus? status = null,
            [FromQuery] string? serviceId = null)
        {
            var (userId, role) = GetCurrentUserInfo();
            var result = await _applicationService.ListAsync(userId, role, page, limit, search, status, serviceId);
            return Ok(ApiResponse<PaginatedData<ApplicationDto>>.Ok(result));
        }

        [HttpPost]
        [Authorize(Roles = "CITIZEN,CITIZEN")]
        public async Task<IActionResult> CreateApplication([FromBody] CreateApplicationDto dto)
        {
            var (userId, _) = GetCurrentUserInfo();
            var application = await _applicationService.CreateAsync(userId, dto);
            return StatusCode(201, ApiResponse<ApplicationDto>.Ok(application));
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetApplication(string id)
        {
            var (userId, role) = GetCurrentUserInfo();
            try
            {
                var application = await _applicationService.GetByIdAsync(userId, role, id);
                return Ok(ApiResponse<ApplicationDto>.Ok(application));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<string>.Fail("Application not found"));
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(403, ApiResponse<string>.Fail("Forbidden"));
            }
        }

        [HttpPost("{id}/submit")]
        [Authorize]
        public async Task<IActionResult> SubmitApplication(string id)
        {
            var (userId, _) = GetCurrentUserInfo();
            try
            {
                var application = await _applicationService.SubmitAsync(userId, id);
                return Ok(ApiResponse<ApplicationDto>.Ok(application));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "OFFICER,ADMIN")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateApplicationStatusDto dto)
        {
            var (officerId, _) = GetCurrentUserInfo();
            try
            {
                var updated = await _applicationService.UpdateStatusAsync(officerId, id, dto.Status, dto.Remarks);
                return Ok(ApiResponse<ApplicationDto>.Ok(updated));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("{id}/certificate")]
        [Authorize]
        public async Task<IActionResult> DownloadCertificate(string id)
        {
            var (userId, role) = GetCurrentUserInfo();
            try
            {
                var application = await _applicationService.GetByIdAsync(userId, role, id);
                if (string.IsNullOrEmpty(application.CertificateNo))
                {
                    return BadRequest(ApiResponse<string>.Fail("Certificate not generated yet"));
                }

                var uploadDir = "./uploads";
                var filePath = Path.Combine(uploadDir, $"certificate-{application.CertificateNo}.pdf");

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(ApiResponse<string>.Fail("Certificate file not found on server"));
                }

                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                return File(fileBytes, "application/pdf", $"Certificate-{application.CertificateNo}.pdf");
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
