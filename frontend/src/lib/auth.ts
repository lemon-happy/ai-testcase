import api from './api';
import { ApiResponse, User, RegisterFormData, LoginFormData } from '@/types/auth';

export async function registerUser(data: RegisterFormData): Promise<ApiResponse<User>> {
  const response = await api.post<ApiResponse<User>>('/api/auth/register', data);
  return response.data;
}

export async function loginUser(data: LoginFormData): Promise<ApiResponse<{ token: string; user: User }>> {
  const response = await api.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', data);
  return response.data;
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const response = await api.get<ApiResponse<User>>('/api/auth/me');
  return response.data;
}
