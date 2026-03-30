'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginUser } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await loginUser(data);
      if (response.success) {
        setAuth(response.data.user, response.data.token);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card w-full">
      <div className="auth-logo">[ AI-TESTCASE ]</div>
      <div className="auth-card-header">
        <h3 className="auth-card-title">登录</h3>
        <p className="auth-card-description">请输入您的邮箱和密码</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">邮箱</label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="auth-input"
              {...register('email')}
            />
            {errors.email && (
              <p className="auth-field-error">{errors.email.message}</p>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="password" className="auth-label">密码</label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              className="auth-input"
              {...register('password')}
            />
            {errors.password && (
              <p className="auth-field-error">{errors.password.message}</p>
            )}
          </div>
        </div>
        <div>
          <Button type="submit" className="auth-btn-submit" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
          <p className="auth-footer">
            还没有账号？{' '}
            <Link href="/register" className="auth-link">
              立即注册
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
