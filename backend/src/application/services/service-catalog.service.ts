import { prisma } from '../../infrastructure/database/prisma';
import { NotFoundError } from '../../domain/entities/errors';
import { PaginationParams, PaginatedResult } from '../../domain/interfaces/types';

export class ServiceCatalogService {
  async list(params: PaginationParams & { category?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (params.category) where.category = params.category;

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { category: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.governmentService.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.governmentService.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    } as PaginatedResult<typeof data[0]>;
  }

  async getBySlug(slug: string) {
    const service = await prisma.governmentService.findUnique({ where: { slug } });
    if (!service || !service.isActive) throw new NotFoundError('Service not found');
    return service;
  }

  async getCategories() {
    const categories = await prisma.governmentService.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map((c) => c.category);
  }
}

export const serviceCatalogService = new ServiceCatalogService();
