import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  });
}
