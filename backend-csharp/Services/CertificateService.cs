using QRCoder;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GovernmentCitizenServices.Api.Services
{
    public class CertificateService
    {
        private readonly IConfiguration _configuration;

        public CertificateService(IConfiguration configuration)
        {
            _configuration = configuration;
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public string GenerateCertificateNo()
        {
            var year = DateTime.UtcNow.Year;
            var random = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
            return $"CERT-{year}-{random}";
        }

        public (string filePath, string qrCodeBase64) GenerateCertificate(
            string certificateNo,
            string applicationNo,
            string serviceName,
            string citizenName,
            DateTime issuedDate,
            string verificationUrl)
        {
            var uploadDir = _configuration["UploadSettings:UploadDirectory"] ?? "./uploads";
            if (!Directory.Exists(uploadDir))
            {
                Directory.CreateDirectory(uploadDir);
            }

            var fileName = $"certificate-{certificateNo}.pdf";
            var filePath = Path.Combine(uploadDir, fileName);

            // Generate QR Code Base64
            using var qrGenerator = new QRCodeGenerator();
            using var qrData = qrGenerator.CreateQrCode(verificationUrl, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrData);
            var qrBytes = qrCode.GetGraphic(20);
            var qrCodeBase64 = $"data:image/png;base64,{Convert.ToBase64String(qrBytes)}";

            // Generate PDF Document using QuestPDF
            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(50);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily("Arial"));

                    page.Header().Column(col =>
                    {
                        col.Item().AlignCenter().Text("Government of India").FontSize(24).Bold().FontColor(Colors.Blue.Medium);
                        col.Item().AlignCenter().Text("Official Certificate").FontSize(18).SemiBold().FontColor(Colors.Grey.Darken2);
                    });

                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        col.Item().Text($"Certificate No: {certificateNo}").Bold();
                        col.Item().Text($"Application No: {applicationNo}");
                        col.Item().Text($"Service Name: {serviceName}");
                        col.Item().Text($"Issued To: {citizenName}");
                        col.Item().Text($"Date of Issue: {issuedDate:dd/MM/yyyy}");

                        col.Item().PaddingTop(20).Text(
                            "This is to certify that the above-mentioned application has been duly processed and approved by the competent authority."
                        ).Justify();

                        col.Item().PaddingTop(30).AlignRight().Width(120).Column(qrCol =>
                        {
                            qrCol.Item().Image(qrBytes);
                            qrCol.Item().AlignCenter().Text("Scan to verify").FontSize(8);
                        });
                    });

                    page.Footer().AlignCenter().Text("Official Digital Document — Verified Online").FontSize(9).FontColor(Colors.Grey.Medium);
                });
            }).GeneratePdf(filePath);

            return (filePath, qrCodeBase64);
        }
    }
}
