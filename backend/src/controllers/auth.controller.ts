import { Request, Response } from 'express';
import { register, login, getMe } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { successResponse, errorResponse } from '../utils/response';

export async function registerController(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return errorResponse(res, '输入数据无效', 400, result.error.flatten().fieldErrors);
  }

  try {
    const user = await register(result.data);
    return successResponse(res, user, '注册成功', 201);
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    return errorResponse(res, error.message || '注册失败', error.statusCode || 500);
  }
}

export async function loginController(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return errorResponse(res, '输入数据无效', 400, result.error.flatten().fieldErrors);
  }

  try {
    const data = await login(result.data);
    return successResponse(res, data, '登录成功');
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    return errorResponse(res, error.message || '登录失败', error.statusCode || 500);
  }
}

export async function getMeController(req: Request, res: Response) {
  try {
    const user = await getMe(req.user!.id);
    return successResponse(res, user);
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    return errorResponse(res, error.message || '获取用户信息失败', error.statusCode || 500);
  }
}
