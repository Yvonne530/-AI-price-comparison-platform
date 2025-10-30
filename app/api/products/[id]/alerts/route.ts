import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const createAlertSchema = z.object({
  targetPrice: z.number().positive('目标价格必须大于0'),
  currency: z.string(),
});

// 获取产品的价格提醒
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    const alerts = await prisma.priceAlert.findMany({
      where: {
        userId,
        productId: params.id,
      },
      include: {
        product: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return successResponse(alerts);
  } catch (error) {
    return handleApiError(error);
  }
}

// 创建价格提醒
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    const body = await request.json();
    const { targetPrice, currency } = createAlertSchema.parse(body);

    // 检查产品是否存在
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return errorResponse('产品不存在', 404);
    }

    // 检查是否已经存在相同的价格提醒
    const existingAlert = await prisma.priceAlert.findFirst({
      where: {
        userId,
        productId: params.id,
        targetPrice,
        currency,
        status: 'ACTIVE',
      },
    });

    if (existingAlert) {
      return errorResponse('已存在相同的价格提醒', 400);
    }

    // 创建价格提醒
    const alert = await prisma.priceAlert.create({
      data: {
        userId,
        productId: params.id,
        targetPrice,
        currency,
      },
    });

    return successResponse(alert);
  } catch (error) {
    return handleApiError(error);
  }
}

// 更新价格提醒状态
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    if (!alertId) {
      return errorResponse('缺少提醒ID', 400);
    }

    const body = await request.json();
    const { status } = body;

    if (!['ACTIVE', 'DISABLED'].includes(status)) {
      return errorResponse('无效的状态', 400);
    }

    // 更新提醒状态
    const alert = await prisma.priceAlert.updateMany({
      where: {
        id: alertId,
        userId,
        productId: params.id,
      },
      data: { status },
    });

    if (alert.count === 0) {
      return errorResponse('价格提醒不存在或无权操作', 404);
    }

    return successResponse({ message: '提醒状态已更新' });
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
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    if (!alertId) {
      return errorResponse('缺少提醒ID', 400);
    }

    // 删除提醒
    const alert = await prisma.priceAlert.deleteMany({
      where: {
        id: alertId,
        userId,
        productId: params.id,
      },
    });

    if (alert.count === 0) {
      return errorResponse('价格提醒不存在或无权操作', 404);
    }

    return successResponse({ message: '价格提醒已删除' });
  } catch (error) {
    return handleApiError(error);
  }
}