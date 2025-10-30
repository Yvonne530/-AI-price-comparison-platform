import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

// 更新用户信息schema
const updateProfileSchema = z.object({
  name: z.string().min(2, '名称至少2个字符').optional(),
  avatar: z.string().url('请输入有效的图片URL').optional(),
});

// 更新密码schema
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, '当前密码至少6个字符'),
  newPassword: z.string().min(6, '新密码至少6个字符'),
});

// 获取用户设置
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        subscription: {
          select: {
            type: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse('用户不存在', 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

// 更新用户设置
export async function PATCH(request: Request) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    const body = await request.json();

    // 根据请求类型处理不同的更新
    if ('currentPassword' in body) {
      // 更新密码
      const { currentPassword, newPassword } = updatePasswordSchema.parse(body);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return errorResponse('用户不存在', 404);
      }

      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return errorResponse('当前密码错误', 400);
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // 删除其他会话
      await prisma.session.deleteMany({
        where: {
          userId,
          id: { not: request.headers.get('X-Session-Id') },
        },
      });

      return successResponse({ message: '密码已更新' });
    } else {
      // 更新个人信息
      const data = updateProfileSchema.parse(body);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      });

      return successResponse(updatedUser);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// 删除账户
export async function DELETE(request: Request) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    // 删除用户相关数据
    await prisma.$transaction([
      // 删除用户的所有会话
      prisma.session.deleteMany({ where: { userId } }),
      // 删除用户的所有通知
      prisma.notification.deleteMany({ where: { userId } }),
      // 删除用户的所有价格提醒
      prisma.priceAlert.deleteMany({ where: { userId } }),
      // 删除用户的所有搜索历史
      prisma.search.deleteMany({ where: { userId } }),
      // 删除用户的所有比较历史
      prisma.comparison.deleteMany({ where: { userId } }),
      // 最后删除用户
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return successResponse({ message: '账户已删除' });
  } catch (error) {
    return handleApiError(error);
  }
}