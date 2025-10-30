import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const preferencesSchema = z.object({
  defaultCurrency: z.string().optional(),
  defaultCountry: z.string().optional(),
  defaultLanguage: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

// 获取用户偏好设置
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      // 返回默认偏好设置
      return successResponse({
        defaultCurrency: 'CNY',
        defaultCountry: 'CN',
        defaultLanguage: 'zh-CN',
        theme: 'system',
        emailNotifications: true,
        pushNotifications: true,
      });
    }

    return successResponse(preferences);
  } catch (error) {
    return handleApiError(error);
  }
}

// 更新用户偏好设置
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const body = await request.json();
    const data = preferencesSchema.parse(body);

    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        ...data,
      },
    });

    return successResponse(updatedPreferences);
  } catch (error) {
    return handleApiError(error);
  }
}