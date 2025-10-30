import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const alertParamsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  status: z.enum(['active', 'triggered', 'all']).default('all'),
});

const alertCreateSchema = z.object({
  productId: z.string(),
  thresholdPrice: z.number().positive(),
  alertType: z.enum(['below', 'above']).default('below'),
});

// 获取用户价格提醒列表
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, status } = alertParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const skip = (page - 1) * limit;
    const where = {
      userId: session.user.id,
      ...(status !== 'all' && { status }),
    };

    // 获取提醒列表
    const [alerts, total] = await Promise.all([
      prisma.priceAlert.findMany({
        where,
        include: {
          product: {
            include: {
              prices: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
              platform: {
                select: {
                  name: true,
                  logo: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.priceAlert.count({ where }),
    ]);

    // 格式化响应数据
    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      productId: alert.productId,
      product: {
        id: alert.product.id,
        name: alert.product.name,
        image: alert.product.image,
        currentPrice: alert.product.prices[0]?.price || null,
        currency: alert.product.prices[0]?.currency || null,
        platform: alert.product.platform,
      },
      thresholdPrice: alert.thresholdPrice,
      alertType: alert.alertType,
      status: alert.status,
      createdAt: alert.createdAt,
      triggeredAt: alert.triggeredAt,
    }));

    return successResponse({
      alerts: formattedAlerts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 创建价格提醒
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const body = await request.json();
    const { productId, thresholdPrice, alertType } = alertCreateSchema.parse(body);

    // 检查产品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!product) {
      return errorResponse('产品不存在', 404);
    }

    // 创建价格提醒
    const alert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        productId,
        thresholdPrice,
        alertType,
        status: 'active',
      },
    });

    return successResponse({
      id: alert.id,
      message: '价格提醒创建成功',
    });
  } catch (error) {
    return handleApiError(error);
  }
}