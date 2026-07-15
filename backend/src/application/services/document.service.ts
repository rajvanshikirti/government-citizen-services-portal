import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { prisma } from '../../infrastructure/database/prisma';
import { AppError } from '../../domain/entities/errors';

const uploadDir = env.UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Only JPEG, PNG, WebP, and PDF files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE },
});

export class DocumentService {
  async saveDocument(
    userId: string,
    file: Express.Multer.File,
    applicationId?: string
  ) {
    if (applicationId) {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
      });
      if (!application || application.userId !== userId) {
        throw new AppError(403, 'Cannot attach document to this application');
      }
    }

    return prisma.document.create({
      data: {
        userId,
        applicationId,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
      },
    });
  }

  async getDocument(userId: string, documentId: string) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document || document.userId !== userId) {
      throw new AppError(404, 'Document not found');
    }
    return document;
  }
}

export const documentService = new DocumentService();
