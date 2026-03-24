'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI 测试用例平台</h1>
          <Button variant="outline" onClick={logout}>
            退出登录
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>欢迎回来，{user?.username}！</CardTitle>
            <CardDescription>
              您已成功登录。邮箱：{user?.email} | 角色：{user?.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              测试用例生成功能即将上线，敬请期待...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
