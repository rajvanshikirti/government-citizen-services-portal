using Microsoft.EntityFrameworkCore;
using GovernmentCitizenServices.Api.Models;

namespace GovernmentCitizenServices.Api.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(ApplicationDbContext context)
        {
            await context.Database.MigrateAsync();

            if (!await context.GovernmentServices.AnyAsync())
            {
                var services = new List<GovernmentService>
                {
                    new GovernmentService
                    {
                        Name = "Birth Certificate",
                        Slug = "birth-certificate",
                        Description = "Apply for a new birth certificate or obtain a duplicate copy.",
                        Category = "Vital Records",
                        ProcessingDays = 5,
                        Fee = 50,
                        RequiredDocs = new[] { "Proof of Birth", "Parent ID Proof", "Address Proof" }
                    },
                    new GovernmentService
                    {
                        Name = "Death Certificate",
                        Slug = "death-certificate",
                        Description = "Register a death and obtain an official death certificate.",
                        Category = "Vital Records",
                        ProcessingDays = 3,
                        Fee = 30,
                        RequiredDocs = new[] { "Medical Certificate", "ID Proof of Deceased", "Applicant ID Proof" }
                    },
                    new GovernmentService
                    {
                        Name = "Income Certificate",
                        Slug = "income-certificate",
                        Description = "Obtain an income certificate for scholarships, subsidies, and benefits.",
                        Category = "Certificates",
                        ProcessingDays = 7,
                        Fee = 20,
                        RequiredDocs = new[] { "Salary Slip", "ITR", "Address Proof", "ID Proof" }
                    },
                    new GovernmentService
                    {
                        Name = "Caste Certificate",
                        Slug = "caste-certificate",
                        Description = "Apply for caste certificate for reservation and welfare schemes.",
                        Category = "Certificates",
                        ProcessingDays = 10,
                        Fee = 25,
                        RequiredDocs = new[] { "School Certificate", "Parent Caste Certificate", "Address Proof" }
                    },
                    new GovernmentService
                    {
                        Name = "Property Tax",
                        Slug = "property-tax",
                        Description = "Pay property tax and obtain tax receipts online.",
                        Category = "Revenue",
                        ProcessingDays = 2,
                        Fee = 0,
                        RequiredDocs = new[] { "Property Documents", "Previous Tax Receipt", "ID Proof" }
                    },
                    new GovernmentService
                    {
                        Name = "Water Connection",
                        Slug = "water-connection",
                        Description = "Apply for new water connection or transfer existing connection.",
                        Category = "Utilities",
                        ProcessingDays = 14,
                        Fee = 500,
                        RequiredDocs = new[] { "Property Ownership Proof", "ID Proof", "NOC from Society" }
                    },
                    new GovernmentService
                    {
                        Name = "Electricity Connection",
                        Slug = "electricity-connection",
                        Description = "Apply for new electricity connection or load enhancement.",
                        Category = "Utilities",
                        ProcessingDays = 10,
                        Fee = 750,
                        RequiredDocs = new[] { "Property Documents", "ID Proof", "Load Sanction Letter" }
                    },
                    new GovernmentService
                    {
                        Name = "Driving Licence Renewal",
                        Slug = "driving-licence-renewal",
                        Description = "Renew your driving licence before expiry.",
                        Category = "Transport",
                        ProcessingDays = 5,
                        Fee = 200,
                        RequiredDocs = new[] { "Existing Driving Licence", "Medical Certificate", "Passport Photo" }
                    }
                };

                await context.GovernmentServices.AddRangeAsync(services);
                await context.SaveChangesAsync();
            }

            // Seed / Upsert Admin User
            var admin = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@govportal.gov");
            if (admin == null)
            {
                admin = new User
                {
                    Email = "admin@govportal.gov",
                    FirstName = "System",
                    LastName = "Admin",
                    Phone = "9999999999",
                    Role = Role.ADMIN,
                    IsActive = true
                };
                await context.Users.AddAsync(admin);
            }
            admin.Password = BCrypt.Net.BCrypt.HashPassword("Password@123");
            admin.IsActive = true;

            // Seed / Upsert Officer User
            var officer = await context.Users.FirstOrDefaultAsync(u => u.Email == "officer@govportal.gov");
            if (officer == null)
            {
                officer = new User
                {
                    Email = "officer@govportal.gov",
                    FirstName = "Verification",
                    LastName = "Officer",
                    Phone = "9876543210",
                    Role = Role.OFFICER,
                    IsActive = true
                };
                await context.Users.AddAsync(officer);
            }
            officer.Password = BCrypt.Net.BCrypt.HashPassword("Password@123");
            officer.IsActive = true;

            // Seed / Upsert Citizen User
            var citizen = await context.Users.FirstOrDefaultAsync(u => u.Email == "citizen@example.com");
            if (citizen == null)
            {
                citizen = new User
                {
                    Email = "citizen@example.com",
                    FirstName = "Rahul",
                    LastName = "Sharma",
                    Phone = "9812345678",
                    AadhaarNumber = "123456789012",
                    Role = Role.CITIZEN,
                    IsActive = true
                };
                await context.Users.AddAsync(citizen);
            }
            citizen.Password = BCrypt.Net.BCrypt.HashPassword("Password@123");
            citizen.IsActive = true;

            await context.SaveChangesAsync();
        }
    }
}
