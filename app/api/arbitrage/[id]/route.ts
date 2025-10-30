import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

// 获取套利机会详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id;
    const session = await getServerSession(authOptions);

    // 获取套利机会详情
    const opportunity = await prisma.arbitrageOpportunity.findUnique({
      where: { id: opportunityId },
      include: {
        sourceProduct: {
          include: {
            platform: true,
            prices: {
              orderBy: { createdAt: 'desc' },
              take: 30,
            },
          },
        },
        targetProduct: {
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

    if (!opportunity) {
      return errorResponse('套利机会不存在', 404);
    }

    // 检查用户是否已跟踪该套利机会
    let isTracked = false;
    if (session?.user) {
      const tracking = await prisma.arbitrageTracking.findFirst({
        where: {
          userId: session.user.id,
          arbitrageOpportunityId: opportunityId,
        },
      });
      isTracked = !!tracking;
    }

    // 格式化响应数据
    const formattedOpportunity = {
      id: opportunity.id,
      sourceProduct: {
        id: opportunity.sourceProduct.id,
        name: opportunity.sourceProduct.name,
        image: opportunity.sourceProduct.image,
        description: opportunity.sourceProduct.description,
        price: opportunity.sourcePrice,
        currency: opportunity.sourceCurrency,
        url: opportunity.sourceProduct.url,
        platform: {
          id: opportunity.sourceProduct.platform.id,
          name: opportunity.sourceProduct.platform.name,
          logo: opportunity.sourceProduct.platform.logo,
          website: opportunity.sourceProduct.platform.website,
        },
        priceHistory: opportunity.sourceProduct.prices.map(price => ({
          price: price.price,
          currency: price.currency,
          date: price.createdAt,
        })),
      },
      targetProduct: {
        id: opportunity.targetProduct.id,
        name: opportunity.targetProduct.name,
        image: opportunity.targetProduct.image,
        description: opportunity.targetProduct.description,
        price: opportunity.targetPrice,
        currency: opportunity.targetCurrency,
        url: opportunity.targetProduct.url,
        platform: {
          id: opportunity.targetProduct.platform.id,
          name: opportunity.targetProduct.platform.name,
          logo: opportunity.targetProduct.platform.logo,
          website: opportunity.targetProduct.platform.website,
        },
        priceHistory: opportunity.targetProduct.prices.map(price => ({
          price: price.price,
          currency: price.currency,
          date: price.createdAt,
        })),
      },
      profit: opportunity.profit,
      profitPercentage: opportunity.profitPercentage,
      isTracked,
      createdAt: opportunity.createdAt,
      updatedAt: opportunity.updatedAt,
    };

    return successResponse(formattedOpportunity);
  } catch (error) {
    return handleApiError(error);
  }
}