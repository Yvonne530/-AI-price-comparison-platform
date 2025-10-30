import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const searchParamsSchema = z.object({
  q: z.string().min(1, '请输入搜索关键词'),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  platform: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = searchParamsSchema.parse(Object.fromEntries(searchParams));
    const userId = request.headers.get('X-User-Id');

    const skip = (params.page - 1) * params.limit;

    // 构建查询条件
    const where = {
      OR: [
        { name: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
      ],
      ...(params.category && { category: params.category }),
      ...(params.brand && { brand: params.brand }),
      prices: {
        some: {
          AND: [
            ...(params.minPrice ? [{ price: { gte: params.minPrice } }] : []),
            ...(params.maxPrice ? [{ price: { lte: params.maxPrice } }] : []),
            ...(params.platform ? [{ platform: params.platform }] : []),
          ],
        },
      },
    };

    // 获取产品列表
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          prices: {
            orderBy: { price: 'asc' },
            take: 1,
          },
          _count: {
            select: { favoriteUsers: true },
          },
        },
        orderBy: params.sort === 'newest'
          ? { createdAt: 'desc' }
          : undefined,
        skip,
        take: params.limit,
      }),
      prisma.product.count({ where }),
    ]);

    // 如果用户已登录，记录搜索历史
    if (userId) {
      await prisma.search.create({
        data: {
          userId,
          query: params.q,
          filters: {
            category: params.category,
            brand: params.brand,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            platform: params.platform,
            sort: params.sort,
          },
        },
      });
    }

    // 格式化响应数据
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      category: product.category,
      brand: product.brand,
      model: product.model,
      bestPrice: product.prices[0]?.price,
      currency: product.prices[0]?.currency,
      platform: product.prices[0]?.platform,
      favoritesCount: product._count.favoriteUsers,
    }));

    return successResponse({
      products: formattedProducts,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}