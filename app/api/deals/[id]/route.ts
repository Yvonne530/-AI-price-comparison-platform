import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

// 获取优惠详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = params.id;

    // 获取优惠详情
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        category: true,
        product: {
          include: {
            platform: true,
            prices: {
              orderBy: { createdAt: 'desc' },
              take: 30,
            },
          },
        },
      },
    });

    if (!deal) {
      return errorResponse('优惠不存在', 404);
    }

    // 获取相关优惠
    const relatedDeals = await prisma.deal.findMany({
      where: {
        id: { not: dealId },
        categoryId: deal.categoryId,
        isActive: true,
      },
      include: {
        product: {
          include: {
            platform: true,
          },
        },
      },
      take: 5,
    });

    // 格式化响应数据
    const formattedDeal = {
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
      terms: deal.terms,
      category: {
        id: deal.category.id,
        name: deal.category.name,
        description: deal.category.description,
      },
      product: deal.product ? {
        id: deal.product.id,
        name: deal.product.name,
        image: deal.product.image,
        description: deal.product.description,
        url: deal.product.url,
        platform: {
          id: deal.product.platform.id,
          name: deal.product.platform.name,
          logo: deal.product.platform.logo,
          website: deal.product.platform.website,
        },
        priceHistory: deal.product.prices.map(price => ({
          price: price.price,
          currency: price.currency,
          date: price.createdAt,
        })),
      } : null,
      createdAt: deal.createdAt,
      relatedDeals: relatedDeals.map(relatedDeal => ({
        id: relatedDeal.id,
        title: relatedDeal.title,
        dealPrice: relatedDeal.dealPrice,
        currency: relatedDeal.currency,
        discountPercentage: relatedDeal.discountPercentage,
        imageUrl: relatedDeal.imageUrl,
        product: relatedDeal.product ? {
          id: relatedDeal.product.id,
          name: relatedDeal.product.name,
          platform: {
            id: relatedDeal.product.platform.id,
            name: relatedDeal.product.platform.name,
            logo: relatedDeal.product.platform.logo,
          },
        } : null,
      })),
    };

    return successResponse(formattedDeal);
  } catch (error) {
    return handleApiError(error);
  }
}