import { Request, Response } from 'express';
import { ApplicationStatus } from '@prisma/client';
import { applicationService } from '../../application/services/application.service';
import { asyncHandler } from '../middleware/error.middleware';

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

function paramCertificateNo(req: Request): string {
  const no = req.params.certificateNo;
  return Array.isArray(no) ? no[0] : no;
}

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId, formData } = req.body;
  const application = await applicationService.create(req.user!.userId, serviceId, formData);
  res.status(201).json({ success: true, data: application });
});

export const submitApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.submit(req.user!.userId, paramId(req));
  res.json({ success: true, data: application });
});

export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.getById(
    req.user!.userId,
    req.user!.role,
    paramId(req)
  );
  res.json({ success: true, data: application });
});

export const listApplications = asyncHandler(async (req: Request, res: Response) => {
  const result = await applicationService.list(req.user!.userId, req.user!.role, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: req.query.search as string,
    status: req.query.status as ApplicationStatus,
    serviceId: req.query.serviceId as string,
  });
  res.json({ success: true, data: result });
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, remarks } = req.body;
  const application = await applicationService.updateStatus(
    req.user!.userId,
    paramId(req),
    status,
    remarks
  );
  res.json({ success: true, data: application });
});

export const verifyCertificate = asyncHandler(async (req: Request, res: Response) => {
  const result = await applicationService.verifyCertificate(paramCertificateNo(req));
  res.json({ success: true, data: result });
});
