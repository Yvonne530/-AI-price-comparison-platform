import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
});

// 获取用户个人资料
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            priceAlerts: true,
            arbitrageTracking: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse('用户不存在', 404);
    }

    return successResponse({
      ...user,
      stats: {
        favoritesCount: user._count.favorites,
        alertsCount: user._count.priceAlerts,
        arbitrageCount: user._count.arbitrageTracking,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 更新用户个人资料
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const body = await request.json();
    const data = profileUpdateSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        phone: true,
        createdAt: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}