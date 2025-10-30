import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';

const dealsParamsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  categoryId: z.string().optional(),
  countryId: z.string().optional(),
  platformId: z.string().optional(),
  sortBy: z.enum(['discountPercentage', 'createdAt']).default('discountPercentage'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 获取优惠与促销列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { 
      page, 
      limit, 
      categoryId, 
      countryId,
      platformId,
      sortBy,
      sortOrder
    } = dealsParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where = {
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(platformId && { product: { platformId } }),
      ...(countryId && { product: { platform: { countryId } } }),
    };

    // 获取优惠列表
    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          category: true,
          product: {
            include: {
              platform: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ]);

    // 格式化响应数据
    const formattedDeals = deals.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      originalPrice: deal.originalPrice,
      dealPrice: deal.dealPrice,
      currency: deal.currency,
      discountPercentage: deal.discountPercentage,
      url: deal.url,
      imageUrl: deal.imageUrl,
      startDate: deal.startDate,
      endDate: deal.endDate,
      category: {
        id: deal.category.id,
        name: deal.category.name,
      },
      product: deal.product ? {
        id: deal.product.id,
        name: deal.product.name,
        image: deal.product.image,
        platform: {
          id: deal.product.platform.id,
          name: deal.product.platform.name,
          logo: deal.product.platform.logo,
        },
      } : null,
      createdAt: deal.createdAt,
    }));

    return successResponse({
      deals: formattedDeals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}