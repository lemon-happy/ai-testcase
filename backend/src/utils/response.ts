import { Response } from 'express';

export function successResponse<T>(res: Response, data: T, message?: string, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
}

export function errorResponse(res: Response, error: string, statusCode = 400, details?: unknown) {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(details !== undefined && { details }),
  });
}
