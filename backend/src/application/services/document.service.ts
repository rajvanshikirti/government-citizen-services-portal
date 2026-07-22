import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../infrastructure/database/prisma';
import { AppError, ForbiddenError, NotFoundError } from '../../domain/entities/errors';

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

  async getDocumentForAccess(userId: string, role: Role, documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { application: true },
    });

    if (!document) throw new NotFoundError('Document not found');

    const isOwner = document.userId === userId;
    const isStaff = role === Role.OFFICER || role === Role.ADMIN;

    if (!isOwner && !isStaff) {
      throw new ForbiddenError('You do not have access to this document');
    }

    if (!fs.existsSync(document.filePath)) {
      throw new NotFoundError('Document file not found on server');
    }

    return document;
  }

  async verifyDocument(officerId: string, role: Role, documentId: string) {
    if (role !== Role.OFFICER && role !== Role.ADMIN) {
      throw new ForbiddenError('Only officers and admins can verify documents');
    }

    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new NotFoundError('Document not found');

    if (document.isVerified) {
      throw new AppError(400, 'Document is already verified');
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        isVerified: true,
        verifiedBy: officerId,
        verifiedAt: new Date(),
      },
    });

    if (document.applicationId) {
      const application = await prisma.application.findUnique({
        where: { id: document.applicationId },
        include: { documents: true, user: true, service: true },
      });

      if (application) {
        const allVerified = application.documents.every((d) => d.isVerified);
        if (allVerified && application.documents.length > 0) {
          await prisma.notification.create({
            data: {
              userId: application.userId,
              title: 'Documents Verified',
              message: `All documents for application ${application.applicationNo} (${application.service.name}) have been verified by the officer.`,
              type: 'SUCCESS',
              link: `/applications/${application.id}`,
            },
          });
        }
      }
    }

    return updated;
  }
}

export const documentService = new DocumentService();
