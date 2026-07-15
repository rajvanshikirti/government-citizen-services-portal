import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/entities/errors';
import { logger } from '../../config/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
