import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const historyParamsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

// 获取比较历史
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = historyParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const skip = (page - 1) * limit;

    // 获取比较历史记录
    const [comparisons, total] = await Promise.all([
      prisma.comparison.findMany({
        where: { userId },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              image: true,
              prices: {
                orderBy: { price: 'asc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comparison.count({
        where: { userId },
      }),
    ]);

    // 格式化响应数据
    const formattedComparisons = comparisons.map(comparison => ({
      id: comparison.id,
      createdAt: comparison.createdAt,
      products: comparison.products.map(product => ({
        id: product.id,
        name: product.name,
        image: product.image,
        bestPrice: product.prices[0]?.price,
        currency: product.prices[0]?.currency,
        platform: product.prices[0]?.platform,
      })),
    }));

    return successResponse({
      comparisons: formattedComparisons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 删除比较历史
export async function DELETE(request: Request) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    const { searchParams } = new URL(request.url);
    const comparisonId = searchParams.get('id');

    if (!comparisonId) {
      // 删除所有比较历史
      await prisma.comparison.deleteMany({
        where: { userId },
      });

      return successResponse({ message: '所有比较历史已删除' });
    } else {
      // 删除指定的比较历史
      const comparison = await prisma.comparison.deleteMany({
        where: {
          id: comparisonId,
          userId,
        },
      });

      if (comparison.count === 0) {
        return errorResponse('比较历史不存在或无权删除', 404);
      }

      return successResponse({ message: '比较历史已删除' });
    }
  } catch (error) {
    return handleApiError(error);
  }
}