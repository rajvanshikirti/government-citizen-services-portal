using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GovernmentCitizenServices.Api.Models
{
    [Table("notifications")]
    public class Notification
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("userId")]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("message")]
        public string Message { get; set; } = string.Empty;

        [Column("type")]
        public NotificationType Type { get; set; } = NotificationType.INFO;

        [Column("isRead")]
        public bool IsRead { get; set; } = false;

        [Column("link")]
        public string? Link { get; set; }

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
