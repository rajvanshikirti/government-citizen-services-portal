using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GovernmentCitizenServices.Api.Models
{
    [Table("applications")]
    public class Application
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("applicationNo")]
        public string ApplicationNo { get; set; } = string.Empty;

        [Required]
        [Column("userId")]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("serviceId")]
        public string ServiceId { get; set; } = string.Empty;

        [Column("status")]
        public ApplicationStatus Status { get; set; } = ApplicationStatus.DRAFT;

        [Column("formData", TypeName = "jsonb")]
        public string FormData { get; set; } = "{}";

        [Column("remarks")]
        public string? Remarks { get; set; }

        [Column("officerId")]
        public string? OfficerId { get; set; }

        [Column("certificateNo")]
        public string? CertificateNo { get; set; }

        [Column("qrCode")]
        public string? QrCode { get; set; }

        [Column("submittedAt")]
        public DateTime? SubmittedAt { get; set; }

        [Column("reviewedAt")]
        public DateTime? ReviewedAt { get; set; }

        [Column("completedAt")]
        public DateTime? CompletedAt { get; set; }

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("ServiceId")]
        public GovernmentService? Service { get; set; }

        public ICollection<Document> Documents { get; set; } = new List<Document>();
        public ICollection<StatusHistory> StatusHistory { get; set; } = new List<StatusHistory>();
    }
}
