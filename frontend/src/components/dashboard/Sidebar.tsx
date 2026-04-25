'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  TestTube2,
  Play,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import type { User } from '@/types/auth';
import type { MenuItem } from '@/types/dashboard';

interface SidebarProps {
  user: User | null;
  pathname: string;
  onLogout: () => void;
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: '测试用例',
    href: '/dashboard/test-cases',
    icon: TestTube2,
  },
  {
    label: '测试执行',
    href: '/dashboard/executions',
    icon: Play,
  },
  {
    label: '报告统计',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    label: '用户设置',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar({ user, pathname, onLogout }: SidebarProps) {
  // 权限过滤（当前所有菜单项对所有角色可见）
  const visibleItems = MENU_ITEMS.filter(
    item => !item.requiredRole || item.requiredRole === user?.role
  );

  return (
    <aside className="dashboard-sidebar flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* 顶部：系统名称 + 用户信息 */}
      <div className="p-6 border-b border-cyan-500/15">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-cyan-400 text-lg font-black">⚡</div>
          <div className="text-cyan-400 font-bold text-xs tracking-widest">
            AI TEST
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-white text-sm">{user?.username}</div>
          <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          <div className="inline-block mt-2 px-2 py-1 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-semibold">
            {user?.role === 'ADMIN' ? '管理员' : '用户'}
          </div>
        </div>
      </div>

      {/* 菜单项 */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                dashboard-nav-item
                flex items-center gap-3 px-4 py-3 rounded-lg
                text-sm font-medium transition-all duration-300
                ${
                  isActive
                    ? 'dashboard-nav-active'
                    : 'text-gray-400 hover:text-gray-200'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 底部：信息区 + 退出按钮 */}
      <div className="p-3 space-y-3 border-t border-cyan-500/15">
        <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="text-xs text-gray-400">最后更新</div>
          <div className="text-xs text-blue-400 font-semibold mt-1">
            {new Date().toLocaleTimeString('zh-CN')}
          </div>
        </div>
        <Button
          onClick={onLogout}
          size="sm"
          className="w-full justify-center bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 transition-all"
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>
    </aside>
  );
}
