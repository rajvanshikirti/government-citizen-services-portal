import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { jwtService } from '../../infrastructure/services/jwt.service';
import { UnauthorizedError, ForbiddenError } from '../../domain/entities/errors';
import { JwtPayload } from '../../domain/interfaces/types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token required');
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwtService.verifyToken(token);
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}
