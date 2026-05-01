# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 安装所有依赖（首次 / 新依赖后）
npm run install:all

# 启动开发环境（前后端并行）
npm run dev

# 仅启动后端（端口 3001）
npm run dev:backend

# 仅启动前端（端口 3000）
npm run dev:frontend

# 数据库操作
docker-compose up -d          # 启动 MySQL 5.7 容器
npm run db:migrate            # 运行 Prisma 迁移（创建/更新表结构）
npm run db:studio             # 打开 Prisma Studio（http://localhost:5555）

# 构建生产包
npm run build

# 前端 lint
npm run lint --prefix frontend
```

后端单独运行（在 `backend/` 目录）：
```bash
npx prisma migrate dev --name <migration_name>  # 创建新迁移
npx prisma generate                              # 重新生成 Prisma Client
```

## 环境变量

复制 `.env.example` 到 `backend/.env`，默认值匹配 docker-compose.yml 的 MySQL 配置：

```
DATABASE_URL="mysql://testuser:testpassword@localhost:3306/ai_testcase"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
```

前端在 `frontend/.env.local` 中配置：`NEXT_PUBLIC_API_URL=http://localhost:3001`

## 架构概览

这是一个 **Monorepo**，根目录通过 `concurrently` 统一管理前后端。

### 后端（`backend/`）

Express + TypeScript，分层架构：`routes → controllers → services`

- **入口**：`src/index.ts` 加载 env，`src/app.ts` 注册中间件（CORS 允许 localhost:3000）和路由，所有 API 挂载在 `/api` 前缀下
- **请求流**：`routes/` 定义路径 → `controllers/` 解析请求/调用 Service/格式化响应 → `services/` 包含所有业务逻辑和 Prisma 查询
- **统一响应格式**：所有响应通过 `utils/response.ts` 的 `successResponse` / `errorResponse` 输出，格式为 `{ success, data/error, message? }`
- **Service 错误抛出约定**：Service 层抛出 `{ statusCode, message }` 对象，Controller 捕获后调用 `errorResponse`
- **密码安全**：所有对外输出的用户对象必须通过 Prisma `select: safeUserSelect` 明确排除 `password` 字段
- **JWT**：`utils/jwt.ts` 封装签发/验证，Payload 为 `{ id, email, role }`；`middleware/auth.middleware.ts` 解析 `Authorization: Bearer <token>` 并挂载到 `req.user`
- **环境变量**：通过 `config/env.ts` 用 Zod 强类型校验，访问 env 变量应从此模块导入
- **全局错误处理**：`middleware/error.middleware.ts` 兜底捕获未处理异常

### 前端（`frontend/`）

Next.js 14 App Router + TypeScript，路由结构：

- `(auth)/login`、`(auth)/register` — 公开页面（Auth 路由组），共享 `(auth)/layout.tsx` 提供暗黑极客风粒子背景，**layout 层不卸载**确保页面切换时动效连续
- `dashboard/` — 受保护区域，`dashboard/layout.tsx` 是客户端鉴权守卫，检查 `isAuthenticated`，未登录则 `router.replace('/login')`
- `page.tsx`（根）— 直接 `redirect('/login')`

**状态管理**：Zustand store（`store/authStore.ts`）持久化到 localStorage key `auth-storage`，保存 `{ user, token, isAuthenticated }`

**API 通信**：`lib/api.ts` 是 axios 实例，请求拦截器从 localStorage 读取 token 注入 `Authorization` 头；响应拦截器在 401 时清除 token 并跳转 `/login`。具体 API 函数在 `lib/auth.ts`。

**UI 风格**：Auth 页面采用暗黑极客风，`components/auth/ParticleCanvas.tsx` 用原生 Canvas API 实现海浪粒子动效；表单容器使用 Glassmorphism（`backdrop-blur`）。其余 UI 组件（Button、Input、Label、Card）为 shadcn/ui 风格，手动维护在 `components/ui/`，使用 Radix UI 原语 + Tailwind CSS 变量体系。

**CSS 架构**：`globals.css` 中 `@layer components` 下定义 `.auth-*` 命名空间（优先级高于 `@layer utilities`），auth 页面专用样式全部在此，避免影响其他页面主题。

### Zod 校验共用规则

前后端使用相同的校验逻辑（非共享包，分别维护）：
- email：合法邮箱
- username：3-50 字符，`/^[a-zA-Z0-9_]+$/`
- password：≥8 字符，含大小写字母和数字

后端：`backend/src/validators/auth.validator.ts`
前端：`LoginForm.tsx` / `RegisterForm.tsx` 内的内联 schema（通过 `@hookform/resolvers/zod` 接入 react-hook-form）

### 数据库

MySQL 5.7，Prisma ORM。当前唯一表为 `users`（对应 Prisma model `User`），含 `UserRole` 枚举（`USER` / `ADMIN`）。迁移文件在 `backend/prisma/migrations/`。

严禁直接删除数据库记录

r
