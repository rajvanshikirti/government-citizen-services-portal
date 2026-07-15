import { z } from 'zod';
import { getAadhaarValidationError, normalizeAadhaar } from '../../domain/validators/aadhaar.validator';

const optionalAadhaarSchema = z
  .string()
  .optional()
  .superRefine((value, ctx) => {
    if (!value || !value.trim()) return;
    const error = getAadhaarValidationError(value);
    if (error) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
    }
  })
  .transform((value) => {
    if (!value || !value.trim()) return undefined;
    return normalizeAadhaar(value);
  });

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
  aadhaarNumber: optionalAadhaarSchema,
});

export const verifyAadhaarSchema = z.object({
  aadhaarNumber: z.string().min(1, 'Aadhaar number is required'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
});

export const createApplicationSchema = z.object({
  serviceId: z.string().uuid(),
  formData: z.record(z.unknown()),
});

export const updateStatusSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED']),
  remarks: z.string().max(1000).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
