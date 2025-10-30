import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  priceAlerts: z.boolean(),
  arbitrageAlerts: z.boolean(),
  newsAndUpdates: z.boolean(),
});

// 更新通知设置
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const body = await request.json();
    const settings = notificationSettingsSchema.parse(body);

    // 更新用户通知设置
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...settings,
      },
      update: settings,
      select: {
        emailNotifications: true,
        pushNotifications: true,
        priceAlerts: true,
        arbitrageAlerts: true,
        newsAndUpdates: true,
      },
    });

    return successResponse(updatedSettings);
  } catch (error) {
    return handleApiError(error);
  }
}