using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GovernmentCitizenServices.Api.Models
{
    [Table("documents")]
    public class Document
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Column("applicationId")]
        public string? ApplicationId { get; set; }

        [Required]
        [Column("userId")]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("fileName")]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [Column("originalName")]
        public string OriginalName { get; set; } = string.Empty;

        [Required]
        [Column("mimeType")]
        public string MimeType { get; set; } = string.Empty;

        [Column("fileSize")]
        public int FileSize { get; set; }

        [Required]
        [Column("filePath")]
        public string FilePath { get; set; } = string.Empty;

        [Column("isVerified")]
        public bool IsVerified { get; set; } = false;

        [Column("verifiedBy")]
        public string? VerifiedBy { get; set; }

        [Column("verifiedAt")]
        public DateTime? VerifiedAt { get; set; }

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ApplicationId")]
        public Application? Application { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
