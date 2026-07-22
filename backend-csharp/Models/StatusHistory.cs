using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GovernmentCitizenServices.Api.Models
{
    [Table("status_history")]
    public class StatusHistory
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("applicationId")]
        public string ApplicationId { get; set; } = string.Empty;

        [Column("status")]
        public ApplicationStatus Status { get; set; }

        [Column("remarks")]
        public string? Remarks { get; set; }

        [Required]
        [Column("changedBy")]
        public string ChangedBy { get; set; } = string.Empty;

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ApplicationId")]
        public Application? Application { get; set; }
    }
}
