import { Router } from 'express';
import { Role } from '@prisma/client';
import * as miscController from '../controllers/misc.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../../application/services/document.service';

const router = Router();

router.use(authenticate);

router.get('/notifications', miscController.listNotifications);
router.get('/notifications/unread-count', miscController.getUnreadCount);
router.patch('/notifications/:id/read', miscController.markNotificationRead);
router.patch('/notifications/read-all', miscController.markAllNotificationsRead);

router.get('/dashboard/stats', miscController.getDashboardStats);

router.get(
  '/reports/by-service',
  authorize(Role.OFFICER, Role.ADMIN),
  miscController.getApplicationsByService
);
router.get(
  '/reports/by-status',
  authorize(Role.OFFICER, Role.ADMIN),
  miscController.getApplicationsByStatus
);
router.get(
  '/reports/monthly-trend',
  authorize(Role.OFFICER, Role.ADMIN),
  miscController.getMonthlyTrend
);

router.get('/admin/users', authorize(Role.ADMIN), miscController.listUsers);
router.patch('/admin/users/:id/toggle-status', authorize(Role.ADMIN), miscController.toggleUserStatus);

router.post('/documents/upload', upload.single('file'), miscController.uploadDocument);
router.get('/documents/:id/view', miscController.viewDocument);
router.patch('/documents/:id/verify', authorize(Role.OFFICER, Role.ADMIN), miscController.verifyDocument);

export default router;
