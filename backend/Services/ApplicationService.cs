using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using GovernmentCitizenServices.Api.Data;
using GovernmentCitizenServices.Api.Dtos;
using GovernmentCitizenServices.Api.Models;

namespace GovernmentCitizenServices.Api.Services
{
    public class ApplicationService
    {
        private readonly ApplicationDbContext _context;
        private readonly CertificateService _certificateService;
        private readonly IConfiguration _configuration;

        public ApplicationService(
            ApplicationDbContext context,
            CertificateService certificateService,
            IConfiguration configuration)
        {
            _context = context;
            _certificateService = certificateService;
            _configuration = configuration;
        }

        private static string GenerateApplicationNo()
        {
            var year = DateTime.UtcNow.Year;
            var random = new Random().Next(100000, 999999);
            return $"APP-{year}-{random}";
        }

        public async Task<ApplicationDto> CreateAsync(string userId, CreateApplicationDto dto)
        {
            var service = await _context.GovernmentServices.FindAsync(dto.ServiceId);
            if (service == null || !service.IsActive)
                throw new KeyNotFoundException("Service not found");

            var jsonFormData = JsonSerializer.Serialize(dto.FormData);

            var application = new Application
            {
                ApplicationNo = GenerateApplicationNo(),
                UserId = userId,
                ServiceId = dto.ServiceId,
                FormData = jsonFormData,
                Status = ApplicationStatus.DRAFT
            };

            await _context.Applications.AddAsync(application);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(userId, Role.CITIZEN, application.Id);
        }

        public async Task<ApplicationDto> SubmitAsync(string userId, string applicationId)
        {
            var application = await _context.Applications
                .Include(a => a.Service)
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null) throw new KeyNotFoundException("Application not found");
            if (application.UserId != userId) throw new UnauthorizedAccessException();
            if (application.Status != ApplicationStatus.DRAFT)
                throw new InvalidOperationException("Only draft applications can be submitted");

            application.Status = ApplicationStatus.SUBMITTED;
            application.SubmittedAt = DateTime.UtcNow;
            application.UpdatedAt = DateTime.UtcNow;

            var history = new StatusHistory
            {
                ApplicationId = applicationId,
                Status = ApplicationStatus.SUBMITTED,
                ChangedBy = userId,
                Remarks = "Application submitted by citizen"
            };

            var notification = new Notification
            {
                UserId = userId,
                Title = "Application Submitted",
                Message = $"Your application {application.ApplicationNo} for {application.Service?.Name} has been submitted.",
                Type = NotificationType.SUCCESS,
                Link = $"/applications/{application.Id}"
            };

            await _context.StatusHistories.AddAsync(history);
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(userId, Role.CITIZEN, applicationId);
        }

        public async Task<ApplicationDto> GetByIdAsync(string userId, Role role, string applicationId)
        {
            var application = await _context.Applications
                .Include(a => a.Service)
                .Include(a => a.User)
                .Include(a => a.Documents)
                .Include(a => a.StatusHistory)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null) throw new KeyNotFoundException("Application not found");

            if (role == Role.CITIZEN && application.UserId != userId)
            {
                throw new UnauthorizedAccessException();
            }

            return MapToDto(application);
        }

        public async Task<PaginatedData<ApplicationDto>> ListAsync(
            string userId,
            Role role,
            int page = 1,
            int limit = 10,
            string? search = null,
            ApplicationStatus? status = null,
            string? serviceId = null)
        {
            var query = _context.Applications
                .Include(a => a.Service)
                .Include(a => a.User)
                .Include(a => a.Documents)
                .Include(a => a.StatusHistory)
                .AsQueryable();

            if (role == Role.CITIZEN)
            {
                query = query.Where(a => a.UserId == userId);
            }

            if (status.HasValue) query = query.Where(a => a.Status == status.Value);
            if (!string.IsNullOrEmpty(serviceId)) query = query.Where(a => a.ServiceId == serviceId);

            if (!string.IsNullOrEmpty(search))
            {
                var lower = search.ToLower();
                query = query.Where(a =>
                    a.ApplicationNo.ToLower().Contains(lower) ||
                    (a.User != null && (a.User.FirstName.ToLower().Contains(lower) || a.User.LastName.ToLower().Contains(lower))));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return new PaginatedData<ApplicationDto>
            {
                Data = items.Select(MapToDto),
                Total = total,
                Page = page,
                Limit = limit,
                TotalPages = (int)Math.Ceiling(total / (double)limit)
            };
        }

        public async Task<ApplicationDto> UpdateStatusAsync(
            string officerId,
            string applicationId,
            ApplicationStatus status,
            string? remarks = null)
        {
            var application = await _context.Applications
                .Include(a => a.Service)
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null) throw new KeyNotFoundException("Application not found");

            application.Status = status;
            application.OfficerId = officerId;
            application.ReviewedAt = DateTime.UtcNow;
            application.Remarks = remarks;
            application.UpdatedAt = DateTime.UtcNow;

            if (status == ApplicationStatus.APPROVED || status == ApplicationStatus.COMPLETED)
            {
                var certNo = _certificateService.GenerateCertificateNo();
                var baseUrl = _configuration["CORS_ORIGIN"] ?? "http://localhost:5173";
                var verifyUrl = $"{baseUrl}/verify/{certNo}";

                var (filePath, qrCode) = _certificateService.GenerateCertificate(
                    certNo,
                    application.ApplicationNo,
                    application.Service?.Name ?? "Government Service",
                    $"{application.User?.FirstName} {application.User?.LastName}",
                    DateTime.UtcNow,
                    verifyUrl);

                application.CertificateNo = certNo;
                application.QrCode = qrCode;
                application.CompletedAt = DateTime.UtcNow;
            }

            var history = new StatusHistory
            {
                ApplicationId = applicationId,
                Status = status,
                ChangedBy = officerId,
                Remarks = remarks ?? $"Status changed to {status}"
            };

            var notification = new Notification
            {
                UserId = application.UserId,
                Title = "Application Status Updated",
                Message = $"Your application {application.ApplicationNo} status is now {status}.",
                Type = status == ApplicationStatus.REJECTED ? NotificationType.ERROR : NotificationType.INFO,
                Link = $"/applications/{application.Id}"
            };

            await _context.StatusHistories.AddAsync(history);
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(officerId, Role.OFFICER, applicationId);
        }

        public async Task<VerifyCertificateResultDto> VerifyCertificateAsync(string certificateNo)
        {
            var app = await _context.Applications
                .Include(a => a.Service)
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.CertificateNo == certificateNo);

            if (app == null || (app.Status != ApplicationStatus.APPROVED && app.Status != ApplicationStatus.COMPLETED))
            {
                throw new KeyNotFoundException("Certificate not found or invalid");
            }

            return new VerifyCertificateResultDto
            {
                Valid = true,
                CertificateNo = app.CertificateNo!,
                ApplicationNo = app.ApplicationNo,
                ServiceName = app.Service?.Name ?? "Service",
                CitizenName = $"{app.User?.FirstName} {app.User?.LastName}",
                IssuedDate = app.CompletedAt
            };
        }

        public static ApplicationDto MapToDto(Application app)
        {
            object formDataObj = new { };
            try
            {
                formDataObj = JsonSerializer.Deserialize<object>(app.FormData) ?? new { };
            }
            catch { }

            return new ApplicationDto
            {
                Id = app.Id,
                ApplicationNo = app.ApplicationNo,
                UserId = app.UserId,
                ServiceId = app.ServiceId,
                Status = app.Status,
                FormData = formDataObj,
                Remarks = app.Remarks,
                OfficerId = app.OfficerId,
                CertificateNo = app.CertificateNo,
                QrCode = app.QrCode,
                SubmittedAt = app.SubmittedAt,
                ReviewedAt = app.ReviewedAt,
                CompletedAt = app.CompletedAt,
                CreatedAt = app.CreatedAt,
                UpdatedAt = app.UpdatedAt,
                Service = app.Service,
                User = app.User != null ? AuthService.MapUserToDto(app.User) : null,
                Documents = app.Documents?.Select(d => new DocumentDto
                {
                    Id = d.Id,
                    ApplicationId = d.ApplicationId,
                    UserId = d.UserId,
                    FileName = d.FileName,
                    OriginalName = d.OriginalName,
                    MimeType = d.MimeType,
                    FileSize = d.FileSize,
                    FilePath = d.FilePath,
                    IsVerified = d.IsVerified,
                    VerifiedBy = d.VerifiedBy,
                    VerifiedAt = d.VerifiedAt,
                    CreatedAt = d.CreatedAt
                }),
                StatusHistory = app.StatusHistory?.OrderByDescending(s => s.CreatedAt).Select(s => new StatusHistoryDto
                {
                    Id = s.Id,
                    ApplicationId = s.ApplicationId,
                    Status = s.Status,
                    Remarks = s.Remarks,
                    ChangedBy = s.ChangedBy,
                    CreatedAt = s.CreatedAt
                })
            };
        }
    }
}
