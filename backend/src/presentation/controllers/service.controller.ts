import { Request, Response } from 'express';
import { serviceCatalogService } from '../../application/services/service-catalog.service';
import { asyncHandler } from '../middleware/error.middleware';

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCatalogService.list({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search as string,
    category: req.query.category as string,
  });
  res.json({ success: true, data: result });
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const service = await serviceCatalogService.getBySlug(slug);
  res.json({ success: true, data: service });
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await serviceCatalogService.getCategories();
  res.json({ success: true, data: categories });
});
