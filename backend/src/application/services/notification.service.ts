import { Role } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma';
import { NotFoundError } from '../../domain/entities/errors';
import { PaginationParams, PaginatedResult } from '../../domain/interfaces/types';

export class NotificationService {
  async list(userId: string, params: PaginationParams & { unreadOnly?: boolean }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (params.unreadOnly) where.isRead = false;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    } as PaginatedResult<typeof data[0]>;
  }

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
}

export class ReportService {
  async getDashboardStats(role: Role, userId?: string) {
    if (role === Role.CITIZEN && userId) {
      const [total, pending, approved, rejected] = await Promise.all([
        prisma.application.count({ where: { userId } }),
        prisma.application.count({
          where: { userId, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
        }),
        prisma.application.count({ where: { userId, status: { in: ['APPROVED', 'COMPLETED'] } } }),
        prisma.application.count({ where: { userId, status: 'REJECTED' } }),
      ]);

      return { total, pending, approved, rejected };
    }

    const [totalUsers, totalApplications, pendingApplications, completedApplications, servicesCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.application.count(),
        prisma.application.count({
          where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
        }),
        prisma.application.count({
          where: { status: { in: ['APPROVED', 'COMPLETED'] } },
        }),
        prisma.governmentService.count({ where: { isActive: true } }),
      ]);

    return { totalUsers, totalApplications, pendingApplications, completedApplications, servicesCount };
  }

  async getApplicationsByService() {
    const services = await prisma.governmentService.findMany({
      where: { isActive: true },
      select: {
        name: true,
        _count: { select: { applications: true } },
      },
    });

    return services.map((s) => ({
      service: s.name,
      count: s._count.applications,
    }));
  }

  async getApplicationsByStatus() {
    const statuses = await prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return statuses.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));
  }

  async getMonthlyTrend(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const applications = await prisma.application.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, status: true },
    });

    const monthlyData: Record<string, number> = {};

    applications.forEach((app) => {
      const key = `${app.createdAt.getFullYear()}-${String(app.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}

export class AdminService {
  async listUsers(params: PaginationParams & { role?: Role }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.role) where.role = params.role;

    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { applications: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    } as PaginatedResult<typeof data[0]>;
  }

  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });
  }
}

export const notificationService = new NotificationService();
export const reportService = new ReportService();
export const adminService = new AdminService();
