using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GovernmentCitizenServices.Api.Dtos;
using GovernmentCitizenServices.Api.Services;

namespace GovernmentCitizenServices.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var result = await _authService.RegisterAsync(dto);
                return StatusCode(201, ApiResponse<AuthResponseDto>.Ok(result, "Registration successful"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);
                return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Login successful"));
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var profile = await _authService.GetProfileAsync(userId);
            return Ok(ApiResponse<UserDto>.Ok(profile));
        }

        [HttpPost("verify-aadhaar")]
        public IActionResult VerifyAadhaar([FromBody] VerifyAadhaarDto dto)
        {
            var clean = (dto.AadhaarNumber ?? "").Replace(" ", "").Replace("-", "");
            var isValid = clean.Length == 12 && clean.All(char.IsDigit);

            return Ok(ApiResponse<object>.Ok(new
            {
                valid = isValid,
                message = isValid ? "Aadhaar number is valid" : "Must be a 12-digit numeric Aadhaar number"
            }));
        }
    }
}
