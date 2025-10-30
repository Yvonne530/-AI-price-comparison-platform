import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const alertUpdateSchema = z.object({
  thresholdPrice: z.number().positive().optional(),
  alertType: z.enum(['below', 'above']).optional(),
  status: z.enum(['active', 'paused']).optional(),
});

// 更新价格提醒
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const alertId = params.id;
    const body = await request.json();
    const data = alertUpdateSchema.parse(body);

    // 检查提醒是否存在且属于当前用户
    const alert = await prisma.priceAlert.findFirst({
      where: {
        id: alertId,
        userId: session.user.id,
      },
    });

    if (!alert) {
      return errorResponse('价格提醒不存在或无权限修改', 404);
    }

    // 更新价格提醒
    const updatedAlert = await prisma.priceAlert.update({
      where: { id: alertId },
      data,
    });

    return successResponse({
      ...updatedAlert,
      message: '价格提醒更新成功',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 删除价格提醒
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const alertId = params.id;

    // 检查提醒是否存在且属于当前用户
    const alert = await prisma.priceAlert.findFirst({
      where: {
        id: alertId,
        userId: session.user.id,
      },
    });

    if (!alert) {
      return errorResponse('价格提醒不存在或无权限删除', 404);
    }

    // 删除价格提醒
    await prisma.priceAlert.delete({
      where: { id: alertId },
    });

    return successResponse({
      message: '价格提醒已删除',
    });
  } catch (error) {
    return handleApiError(error);
  }
}