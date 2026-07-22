import { Router } from 'express';
import { Role } from '@prisma/client';
import * as applicationController from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createApplicationSchema, updateStatusSchema } from '../validators/schemas';

const router = Router();

router.get('/verify/:certificateNo', applicationController.verifyCertificate);

router.use(authenticate);

router.get('/', applicationController.listApplications);
router.post('/', authorize(Role.CITIZEN), validate(createApplicationSchema), applicationController.createApplication);
router.get('/:id', applicationController.getApplication);
router.get('/:id/certificate', applicationController.downloadCertificate);
router.post('/:id/submit', authorize(Role.CITIZEN), applicationController.submitApplication);
router.patch(
  '/:id/status',
  authorize(Role.OFFICER, Role.ADMIN),
  validate(updateStatusSchema),
  applicationController.updateApplicationStatus
);

export default router;
