import { ApplicationStatus, Prisma, Role } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma';
import { AppError, ForbiddenError, NotFoundError } from '../../domain/entities/errors';
import { PaginationParams, PaginatedResult } from '../../domain/interfaces/types';
import { emailService } from '../../infrastructure/services/email.service';
import { certificateService } from '../../infrastructure/services/certificate.service';
import { env } from '../../config/env';

function generateApplicationNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `APP-${year}-${random}`;
}

export class ApplicationService {
  async create(userId: string, serviceId: string, formData: Record<string, unknown>) {
    const service = await prisma.governmentService.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) throw new NotFoundError('Service not found');

    const application = await prisma.application.create({
      data: {
        applicationNo: generateApplicationNo(),
        userId,
        serviceId,
        formData: formData as Prisma.InputJsonValue,
        status: ApplicationStatus.DRAFT,
      },
      include: { service: true },
    });

    return application;
  }

  async submit(userId: string, applicationId: string) {
    const application = await this.findOwnedApplication(userId, applicationId);

    if (application.status !== ApplicationStatus.DRAFT) {
      throw new AppError(400, 'Only draft applications can be submitted');
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.SUBMITTED,
        submittedAt: new Date(),
        statusHistory: {
          create: {
            status: ApplicationStatus.SUBMITTED,
            changedBy: userId,
            remarks: 'Application submitted by citizen',
          },
        },
      },
      include: { service: true, user: true },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Application Submitted',
        message: `Your application ${updated.applicationNo} for ${updated.service.name} has been submitted.`,
        type: 'SUCCESS',
        link: `/applications/${updated.id}`,
      },
    });

    await emailService.sendApplicationStatusEmail(
      updated.user.email,
      updated.applicationNo,
      'SUBMITTED',
      updated.service.name
    );

    return updated;
  }

  async getById(userId: string, role: Role, applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        service: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        documents: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!application) throw new NotFoundError('Application not found');

    if (role === Role.CITIZEN && application.userId !== userId) {
      throw new ForbiddenError();
    }

    return application;
  }

  async list(userId: string, role: Role, params: PaginationParams & { status?: ApplicationStatus; serviceId?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role === Role.CITIZEN) {
      where.userId = userId;
    }

    if (params.status) where.status = params.status;
    if (params.serviceId) where.serviceId = params.serviceId;

    if (params.search) {
      where.OR = [
        { applicationNo: { contains: params.search, mode: 'insensitive' } },
        { user: { firstName: { contains: params.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { id: true, name: true, slug: true, category: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    } as PaginatedResult<typeof data[0]>;
  }

  async updateStatus(officerId: string, applicationId: string, status: ApplicationStatus, remarks?: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { service: true, user: true },
    });

    if (!application) throw new NotFoundError('Application not found');

    const updateData: Record<string, unknown> = {
      status,
      officerId,
      reviewedAt: new Date(),
      remarks,
    };

    if (status === ApplicationStatus.APPROVED || status === ApplicationStatus.COMPLETED) {
      const certificateNo = certificateService.generateCertificateNo();
      const verificationUrl = `${env.CORS_ORIGIN}/verify/${certificateNo}`;

      const { qrCode } = await certificateService.generateCertificate({
        certificateNo,
        applicationNo: application.applicationNo,
        serviceName: application.service.name,
        citizenName: `${application.user.firstName} ${application.user.lastName}`,
        issuedDate: new Date(),
        verificationUrl,
      });

      updateData.certificateNo = certificateNo;
      updateData.qrCode = qrCode;
      updateData.completedAt = new Date();
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        ...updateData,
        statusHistory: {
          create: {
            status,
            changedBy: officerId,
            remarks: remarks || `Status changed to ${status}`,
          },
        },
      },
      include: { service: true, user: true },
    });

    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: 'Application Status Updated',
        message: `Your application ${application.applicationNo} status is now ${status}.`,
        type: status === ApplicationStatus.REJECTED ? 'ERROR' : 'INFO',
        link: `/applications/${application.id}`,
      },
    });

    await emailService.sendApplicationStatusEmail(
      application.user.email,
      application.applicationNo,
      status,
      application.service.name
    );

    return updated;
  }

  async verifyCertificate(certificateNo: string) {
    const application = await prisma.application.findUnique({
      where: { certificateNo },
      include: {
        service: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!application || application.status !== ApplicationStatus.COMPLETED && application.status !== ApplicationStatus.APPROVED) {
      throw new NotFoundError('Certificate not found or invalid');
    }

    return {
      valid: true,
      certificateNo: application.certificateNo,
      applicationNo: application.applicationNo,
      serviceName: application.service.name,
      citizenName: `${application.user.firstName} ${application.user.lastName}`,
      issuedDate: application.completedAt,
    };
  }

  private async findOwnedApplication(userId: string, applicationId: string) {
    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) throw new NotFoundError('Application not found');
    if (application.userId !== userId) throw new ForbiddenError();
    return application;
  }
}

export const applicationService = new ApplicationService();
