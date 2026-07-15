import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../../domain/entities/errors';

export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ');
      throw new ValidationError(messages);
    }

    if (source === 'body') {
      req.body = result.data;
    } else {
      req.query = result.data as Record<string, string>;
    }

    next();
  };
}
