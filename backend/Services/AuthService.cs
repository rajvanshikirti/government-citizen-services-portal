using Microsoft.EntityFrameworkCore;
using GovernmentCitizenServices.Api.Data;
using GovernmentCitizenServices.Api.Dtos;
using GovernmentCitizenServices.Api.Models;

namespace GovernmentCitizenServices.Api.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService;

        public AuthService(ApplicationDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                throw new InvalidOperationException("Email already registered");
            }

            if (!string.IsNullOrEmpty(dto.AadhaarNumber) &&
                await _context.Users.AnyAsync(u => u.AadhaarNumber == dto.AadhaarNumber))
            {
                throw new InvalidOperationException("Aadhaar number already registered");
            }

            var user = new User
            {
                Email = dto.Email.ToLower(),
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                AadhaarNumber = dto.AadhaarNumber,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                Pincode = dto.Pincode,
                Role = Role.CITIZEN
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);

            return new AuthResponseDto
            {
                User = MapUserToDto(user),
                AccessToken = token
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            {
                throw new InvalidOperationException("Invalid credentials");
            }

            if (!user.IsActive)
            {
                throw new InvalidOperationException("User account is deactivated");
            }

            var token = _jwtService.GenerateToken(user);

            return new AuthResponseDto
            {
                User = MapUserToDto(user),
                AccessToken = token
            };
        }

        public async Task<UserDto> GetProfileAsync(string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) throw new KeyNotFoundException("User not found");
            return MapUserToDto(user);
        }

        public static UserDto MapUserToDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,
                AadhaarNumber = user.AadhaarNumber,
                Address = user.Address,
                City = user.City,
                State = user.State,
                Pincode = user.Pincode,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
