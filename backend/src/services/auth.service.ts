import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

const prisma = new PrismaClient();

const safeUserSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === input.email) {
      throw { statusCode: 409, message: '该邮箱已被注册' };
    }
    throw { statusCode: 409, message: '该用户名已被使用' };
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      password: hashedPassword,
    },
    select: safeUserSelect,
  });

  return user;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw { statusCode: 401, message: '邮箱或密码错误' };
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw { statusCode: 401, message: '邮箱或密码错误' };
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  const { password: _, ...safeUser } = user;

  return { token, user: safeUser };
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    throw { statusCode: 404, message: '用户不存在' };
  }

  return user;
}
