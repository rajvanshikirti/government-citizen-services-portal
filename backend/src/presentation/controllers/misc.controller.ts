import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import {
  notificationService,
  reportService,
  adminService,
} from '../../application/services/notification.service';
import { documentService } from '../../application/services/document.service';
import { asyncHandler } from '../middleware/error.middleware';

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.list(req.user!.userId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    unreadOnly: req.query.unreadOnly === 'true',
  });
  res.json({ success: true, data: result });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await notificationService.markAsRead(req.user!.userId, id);
  res.json({ success: true, message: 'Notification marked as read' });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!.userId);
  res.json({ success: true, message: 'All notifications marked as read' });
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  res.json({ success: true, data: { count } });
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await reportService.getDashboardStats(req.user!.role, req.user!.userId);
  res.json({ success: true, data: stats });
});

export const getApplicationsByService = asyncHandler(async (_req: Request, res: Response) => {
  const data = await reportService.getApplicationsByService();
  res.json({ success: true, data });
});

export const getApplicationsByStatus = asyncHandler(async (_req: Request, res: Response) => {
  const data = await reportService.getApplicationsByStatus();
  res.json({ success: true, data });
});

export const getMonthlyTrend = asyncHandler(async (req: Request, res: Response) => {
  const months = Number(req.query.months) || 6;
  const data = await reportService.getMonthlyTrend(months);
  res.json({ success: true, data });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.listUsers({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search as string,
    role: req.query.role as Role,
  });
  res.json({ success: true, data: result });
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await adminService.toggleUserStatus(id);
  res.json({ success: true, data: user });
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const document = await documentService.saveDocument(
    req.user!.userId,
    req.file,
    req.body.applicationId
  );
  res.status(201).json({ success: true, data: document });
});
