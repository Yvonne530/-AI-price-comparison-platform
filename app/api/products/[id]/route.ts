import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('X-User-Id');

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        prices: {
          orderBy: { price: 'asc' },
        },
        _count: {
          select: { favoriteUsers: true },
        },
        ...(userId && {
          favoriteUsers: {
            where: { id: userId },
            select: { id: true },
          },
        }),
      },
    });

    if (!product) {
      return errorResponse('产品不存在', 404);
    }

    // 格式化响应数据
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      category: product.category,
      brand: product.brand,
      model: product.model,
      prices: product.prices.map(price => ({
        id: price.id,
        price: price.price,
        currency: price.currency,
        platform: price.platform,
        url: price.url,
        inStock: price.inStock,
      })),
      favoritesCount: product._count.favoriteUsers,
      isFavorited: userId ? product.favoriteUsers.length > 0 : false,
    };

    return successResponse(formattedProduct);
  } catch (error) {
    return handleApiError(error);
  }
}

// 更新产品收藏状态
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return errorResponse('未授权访问', 401);
    }

    const body = await request.json();
    const { favorite } = body;

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        favoriteUsers: {
          where: { id: userId },
          select: { id: true },
        },
      },
    });

    if (!product) {
      return errorResponse('产品不存在', 404);
    }

    const isFavorited = product.favoriteUsers.length > 0;

    if (favorite && !isFavorited) {
      // 添加收藏
      await prisma.product.update({
        where: { id: params.id },
        data: {
          favoriteUsers: {
            connect: { id: userId },
          },
        },
      });
    } else if (!favorite && isFavorited) {
      // 取消收藏
      await prisma.product.update({
        where: { id: params.id },
        data: {
          favoriteUsers: {
            disconnect: { id: userId },
          },
        },
      });
    }

    return successResponse({
      message: favorite ? '已添加到收藏' : '已取消收藏',
      favorite,
    });
  } catch (error) {
    return handleApiError(error);
  }
}