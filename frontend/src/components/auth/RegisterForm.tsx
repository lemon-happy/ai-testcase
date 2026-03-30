'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerUser } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  username: z
    .string()
    .min(3, '用户名至少3个字符')
    .max(50, '用户名最多50个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z
    .string()
    .min(8, '密码至少8个字符')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[0-9]/, '密码必须包含数字'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await registerUser(data);
      if (response.success) {
        router.push('/login?registered=true');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card w-full">
      <div className="auth-logo">[ AI-TESTCASE ]</div>
      <div className="auth-card-header">
        <h3 className="auth-card-title">创建账号</h3>
        <p className="auth-card-description">填写以下信息完成注册</p>
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
            <label htmlFor="username" className="auth-label">用户名</label>
            <Input
              id="username"
              type="text"
              placeholder="username"
              className="auth-input"
              {...register('username')}
            />
            {errors.username && (
              <p className="auth-field-error">{errors.username.message}</p>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="password" className="auth-label">密码</label>
            <Input
              id="password"
              type="password"
              placeholder="至少8位，含大小写字母和数字"
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
            {isLoading ? '注册中...' : '注册'}
          </Button>
          <p className="auth-footer">
            已有账号？{' '}
            <Link href="/login" className="auth-link">
              立即登录
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
