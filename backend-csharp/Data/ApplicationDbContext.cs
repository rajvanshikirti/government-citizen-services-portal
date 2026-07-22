using Microsoft.EntityFrameworkCore;
using GovernmentCitizenServices.Api.Models;

namespace GovernmentCitizenServices.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<GovernmentService> GovernmentServices { get; set; } = null!;
        public DbSet<Application> Applications { get; set; } = null!;
        public DbSet<Document> Documents { get; set; } = null!;
        public DbSet<StatusHistory> StatusHistories { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.AadhaarNumber)
                .IsUnique();

            modelBuilder.Entity<GovernmentService>()
                .HasIndex(s => s.Slug)
                .IsUnique();

            modelBuilder.Entity<Application>()
                .HasIndex(a => a.ApplicationNo)
                .IsUnique();

            modelBuilder.Entity<Application>()
                .HasIndex(a => a.CertificateNo)
                .IsUnique();

            // Enum to string conversions for PostgreSQL mapping
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Application>()
                .Property(a => a.Status)
                .HasConversion<string>();

            modelBuilder.Entity<StatusHistory>()
                .Property(s => s.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Notification>()
                .Property(n => n.Type)
                .HasConversion<string>();
        }
    }
}
