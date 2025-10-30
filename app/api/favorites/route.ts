import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const favoriteParamsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  sort: z.enum(['latest', 'price_asc', 'price_desc']).optional(),
});

const favoriteCreateSchema = z.object({
  productId: z.string(),
});

// 获取用户收藏列表
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, sort } = favoriteParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const skip = (page - 1) * limit;

    // 获取收藏列表
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: session.user.id },
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
        orderBy: sort === 'price_asc' 
          ? { product: { prices: { price: 'asc' } } }
          : sort === 'price_desc'
            ? { product: { prices: { price: 'desc' } } }
            : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.favorite.count({
        where: { userId: session.user.id },
      }),
    ]);

    // 格式化响应数据
    const formattedFavorites = favorites.map(favorite => ({
      id: favorite.id,
      productId: favorite.productId,
      product: {
        id: favorite.product.id,
        name: favorite.product.name,
        image: favorite.product.image,
        currentPrice: favorite.product.prices[0]?.price || null,
        currency: favorite.product.prices[0]?.currency || null,
        platform: favorite.product.platform,
      },
      createdAt: favorite.createdAt,
    }));

    return successResponse({
      favorites: formattedFavorites,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 添加产品到收藏
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const body = await request.json();
    const { productId } = favoriteCreateSchema.parse(body);

    // 检查产品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse('产品不存在', 404);
    }

    // 检查是否已收藏
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    if (existingFavorite) {
      return errorResponse('已添加到收藏', 400);
    }

    // 添加到收藏
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    return successResponse({
      id: favorite.id,
      message: '已添加到收藏',
    });
  } catch (error) {
    return handleApiError(error);
  }
}