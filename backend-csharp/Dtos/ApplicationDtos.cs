using System.ComponentModel.DataAnnotations;
using GovernmentCitizenServices.Api.Models;

namespace GovernmentCitizenServices.Api.Dtos
{
    public class CreateApplicationDto
    {
        [Required]
        public string ServiceId { get; set; } = string.Empty;

        [Required]
        public object FormData { get; set; } = new { };
    }

    public class UpdateApplicationStatusDto
    {
        [Required]
        public ApplicationStatus Status { get; set; }

        public string? Remarks { get; set; }
    }

    public class ApplicationDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationNo { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string ServiceId { get; set; } = string.Empty;
        public ApplicationStatus Status { get; set; }
        public object FormData { get; set; } = new { };
        public string? Remarks { get; set; }
        public string? OfficerId { get; set; }
        public string? CertificateNo { get; set; }
        public string? QrCode { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public GovernmentService? Service { get; set; }
        public UserDto? User { get; set; }
        public IEnumerable<DocumentDto>? Documents { get; set; }
        public IEnumerable<StatusHistoryDto>? StatusHistory { get; set; }
    }

    public class DocumentDto
    {
        public string Id { get; set; } = string.Empty;
        public string? ApplicationId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string OriginalName { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public int FileSize { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public string? VerifiedBy { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class StatusHistoryDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public ApplicationStatus Status { get; set; }
        public string? Remarks { get; set; }
        public string ChangedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class VerifyCertificateResultDto
    {
        public bool Valid { get; set; }
        public string CertificateNo { get; set; } = string.Empty;
        public string ApplicationNo { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string CitizenName { get; set; } = string.Empty;
        public DateTime? IssuedDate { get; set; }
    }
}
