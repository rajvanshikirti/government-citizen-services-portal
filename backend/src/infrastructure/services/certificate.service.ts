import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';
import { v4 as uuidv4 } from 'uuid';

interface CertificateData {
  certificateNo: string;
  applicationNo: string;
  serviceName: string;
  citizenName: string;
  issuedDate: Date;
  verificationUrl: string;
}

export class CertificateService {
  async generateCertificate(data: CertificateData): Promise<{ filePath: string; qrCode: string }> {
    const qrCodeData = await QRCode.toDataURL(data.verificationUrl);
    const fileName = `certificate-${data.certificateNo}.pdf`;
    const filePath = path.join(env.UPLOAD_DIR, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      doc.fontSize(24).fillColor('#1e40af').text('Government of India', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(18).text('Official Certificate', { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12).fillColor('#000');
      doc.text(`Certificate No: ${data.certificateNo}`);
      doc.text(`Application No: ${data.applicationNo}`);
      doc.text(`Service: ${data.serviceName}`);
      doc.text(`Issued To: ${data.citizenName}`);
      doc.text(`Date of Issue: ${data.issuedDate.toLocaleDateString('en-IN')}`);
      doc.moveDown(2);

      doc.text('This is to certify that the above-mentioned application has been duly processed and approved by the competent authority.', {
        align: 'justify',
      });
      doc.moveDown(2);

      const qrBuffer = Buffer.from(qrCodeData.split(',')[1], 'base64');
      doc.image(qrBuffer, doc.page.width - 150, doc.y, { width: 100 });
      doc.fontSize(8).text('Scan to verify', doc.page.width - 150, doc.y + 105, { width: 100, align: 'center' });

      doc.end();

      stream.on('finish', () => resolve({ filePath, qrCode: qrCodeData }));
      stream.on('error', reject);
    });
  }

  generateCertificateNo(): string {
    const year = new Date().getFullYear();
    const random = uuidv4().split('-')[0].toUpperCase();
    return `CERT-${year}-${random}`;
  }
}

export const certificateService = new CertificateService();
