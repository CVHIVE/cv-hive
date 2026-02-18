import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const messages = error.errors?.map((e: any) => {
        const field = e.path?.join('.') || 'field';
        return `${field}: ${e.message}`;
      }) || ['Invalid input'];
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        errors: error.errors,
      });
    }
  };
};
