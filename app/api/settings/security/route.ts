import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const securitySettingsSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

// 更新安全设置（密码）
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = securitySettingsSchema.parse(body);

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return errorResponse('用户不存在', 404);
    }

    // 验证当前密码
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return errorResponse('当前密码错误', 400);
    }

    // 更新密码
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 删除所有会话（强制重新登录）
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return successResponse({
      message: '密码已更新，请重新登录',
    });
  } catch (error) {
    return handleApiError(error);
  }
}