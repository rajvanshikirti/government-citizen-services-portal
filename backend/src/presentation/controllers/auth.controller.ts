import { Request, Response } from 'express';
import { authService } from '../../application/services/auth.service';
import { asyncHandler } from '../middleware/error.middleware';
import { getAadhaarValidationError, normalizeAadhaar } from '../../domain/validators/aadhaar.validator';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

export const verifyAadhaar = asyncHandler(async (req: Request, res: Response) => {
  const normalized = normalizeAadhaar(String(req.body.aadhaarNumber));
  const error = getAadhaarValidationError(normalized);

  res.json({
    success: true,
    data: {
      valid: !error,
      message: error || 'Aadhaar number is valid',
    },
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.getProfile(req.user!.userId);
  res.json({ success: true, data: profile });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.updateProfile(req.user!.userId, req.body);
  res.json({ success: true, data: profile });
});
