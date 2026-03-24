# 智能测试用例生成平台 - 基础框架 + 用户管理模块

## Context

全新项目，目录为空。目标是搭建可扩展的全栈平台脚手架，当前阶段仅实现用户注册/登录功能，为后续测试用例生成等核心业务打好地基。

**技术栈：**
- 前端：Next.js 14 (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui
- 后端：Node.js + Express + TypeScript + Prisma ORM
- 数据库：MySQL 5.7
- 认证：JWT + bcrypt
- 校验：Zod（前后端共用相同规则）
- 状态管理：Zustand（持久化到 localStorage）

---

## 目录结构

```
ai-testcase/
├── package.json                    # Monorepo 根入口（concurrently 同时启动前后端）
├── docker-compose.yml              # MySQL 5.7 本地环境
├── .env.example                    # 环境变量模板
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts                # 启动入口
│       ├── app.ts                  # Express + 中间件注册
│       ├── config/env.ts           # 环境变量读取
│       ├── routes/
│       │   ├── index.ts
│       │   └── auth.routes.ts
│       ├── controllers/
│       │   └── auth.controller.ts
│       ├── services/
│       │   └── auth.service.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts  # JWT 鉴权
│       │   └── error.middleware.ts
│       ├── validators/
│       │   └── auth.validator.ts   # Zod Schema
│       ├── utils/
│       │   ├── jwt.ts
│       │   └── response.ts         # 统一响应格式
│       └── types/
│           └── express.d.ts        # req.user 类型扩展
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── components.json             # shadcn/ui 配置
    ├── .env.local
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx            # 首页 → 重定向
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   └── dashboard/
        │       ├── layout.tsx      # 鉴权守卫
        │       └── page.tsx
        ├── components/
        │   ├── ui/                 # shadcn/ui 组件（Button, Card, Input, Form）
        │   └── auth/
        │       ├── LoginForm.tsx
        │       └── RegisterForm.tsx
        ├── lib/
        │   ├── api.ts              # axios 实例 + 拦截器
        │   ├── auth.ts             # API 调用函数
        │   └── utils.ts            # cn() 工具
        ├── hooks/useAuth.ts
        ├── store/authStore.ts      # Zustand（持久化）
        └── types/auth.ts
```

---

## 数据库 Schema（Prisma）

**文件：`backend/prisma/schema.prisma`**

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  username  String   @unique @db.VarChar(50)
  password  String   @db.VarChar(255)
  role      UserRole @default(USER)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

enum UserRole {
  USER
  ADMIN
}
```

---

## API 接口

| 方法 | 路径 | 描述 | 鉴权 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 无 |
| POST | /api/auth/login | 登录，返回 JWT | 无 |
| GET | /api/auth/me | 获取当前用户 | Bearer JWT |

**统一响应格式：**
- 成功：`{ success: true, data: T, message?: string }`
- 失败：`{ success: false, error: string, details?: unknown }`

---

## 关键实现要点

### 后端

**auth.service.ts 核心逻辑：**
- `register`：查重（email/username 409）→ bcrypt.hash(password, 12) → prisma.user.create → 返回安全用户对象（排除 password）
- `login`：查用户 → bcrypt.compare → 失败统一返回"邮箱或密码错误"（防枚举）→ jwt.sign → 返回 token + 安全用户对象
- 所有查询用 Prisma `select` 明确排除 `password` 字段对外输出

**auth.middleware.ts：**
```
Authorization: Bearer <token> → jwt.verify() → req.user = { id, email, role } → next()
失败 → 401
```

**CORS 配置（app.ts）：**
```typescript
cors({ origin: 'http://localhost:3000', credentials: true })
```

### 前端

**api.ts 拦截器：**
- 请求拦截：从 localStorage 读取 token，注入 `Authorization: Bearer <token>`
- 响应拦截：401 → 清除 token → `window.location.href = '/login'`

**authStore.ts（Zustand）：**
```typescript
{ user, token, isAuthenticated } + persist 到 localStorage key='auth-storage'
```

**dashboard/layout.tsx 鉴权守卫：**
- Client Component，useEffect 检查 `isAuthenticated`
- 未认证 → `router.replace('/login')`
- 认证中显示 Loading，通过后渲染 children

**Zod 校验规则（前后端一致）：**
- email：合法邮箱格式
- username：3-50字符，`/^[a-zA-Z0-9_]+$/`
- password：≥8字符，含大小写字母和数字

---

## 关键文件

- `backend/prisma/schema.prisma` — 数据库 Schema
- `backend/src/services/auth.service.ts` — 核心业务逻辑
- `backend/src/middleware/auth.middleware.ts` — JWT 鉴权门禁
- `backend/src/validators/auth.validator.ts` — Zod 校验规则
- `frontend/src/store/authStore.ts` — 全局认证状态
- `frontend/src/lib/api.ts` — 前后端通信入口

---

## 实现顺序

1. 根目录：`package.json`、`docker-compose.yml`、`.env.example`、`.gitignore`
2. 后端：初始化项目 → Prisma schema → 数据库迁移 → utils/validators → service → middleware → controller → routes → app/index
3. 前端：Next.js 初始化 → 安装依赖 → shadcn/ui 初始化 → 类型/store/api → 组件 → 页面

---

## 验证方案

### 启动流程
```bash
npm run install:all                     # 安装所有依赖
# 配置 backend/.env 和 frontend/.env.local
npm run db:migrate                      # 运行数据库迁移
npm run dev                             # 同时启动前后端
```

### 后端 curl 测试
```bash
# 正常注册（期望 201）
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Password123"}'

# 重复注册（期望 409）
# 密码弱校验（期望 400）

# 正常登录（期望 200，含 token）
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# 获取当前用户（期望 200）
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <token>"

# 无 token 访问（期望 401）
curl http://localhost:3001/api/auth/me
```

### 前端界面测试

| 场景 | 期望结果 |
|------|----------|
| 直接访问 /dashboard | 重定向到 /login |
| 前端表单弱密码提交 | 即时错误提示，不发请求 |
| 正常注册 | 成功提示，跳转登录页 |
| 正常登录 | 跳转 dashboard，显示用户名 |
| 错误密码登录 | 显示"邮箱或密码错误" |
| 刷新页面 | 保持登录状态（Zustand persist） |
| 退出登录 | 清除 token，跳转 /login |

### 数据库验证
```bash
npm run db:studio   # 打开 http://localhost:5555
# 检查 users 表，password 字段应为 $2b$... 格式的 bcrypt hash
```
