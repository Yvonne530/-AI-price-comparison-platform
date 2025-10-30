import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const arbitrageParamsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  minProfitPercentage: z.string().transform(Number).optional(),
  countryId: z.string().optional(),
  sortBy: z.enum(['profit', 'profitPercentage', 'createdAt']).default('profitPercentage'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 获取套利机会列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { 
      page, 
      limit, 
      minProfitPercentage, 
      countryId,
      sortBy,
      sortOrder
    } = arbitrageParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where = {
      ...(minProfitPercentage && { profitPercentage: { gte: minProfitPercentage } }),
      ...(countryId && { 
        OR: [
          { sourcePlatform: { countryId } },
          { targetPlatform: { countryId } }
        ]
      }),
      isActive: true,
    };

    // 获取套利机会列表
    const [opportunities, total] = await Promise.all([
      prisma.arbitrageOpportunity.findMany({
        where,
        include: {
          sourceProduct: {
            include: {
              platform: true,
            },
          },
          targetProduct: {
            include: {
              platform: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.arbitrageOpportunity.count({ where }),
    ]);

    // 获取当前用户的跟踪状态
    const session = await getServerSession(authOptions);
    let userTracking = [];
    
    if (session?.user) {
      const opportunityIds = opportunities.map(opp => opp.id);
      userTracking = await prisma.arbitrageTracking.findMany({
        where: {
          userId: session.user.id,
          arbitrageOpportunityId: { in: opportunityIds },
        },
        select: {
          arbitrageOpportunityId: true,
        },
      });
    }

    const trackedOpportunityIds = new Set(userTracking.map(t => t.arbitrageOpportunityId));

    // 格式化响应数据
    const formattedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      sourceProduct: {
        id: opp.sourceProduct.id,
        name: opp.sourceProduct.name,
        image: opp.sourceProduct.image,
        price: opp.sourcePrice,
        currency: opp.sourceCurrency,
        platform: {
          id: opp.sourceProduct.platform.id,
          name: opp.sourceProduct.platform.name,
          logo: opp.sourceProduct.platform.logo,
        },
      },
      targetProduct: {
        id: opp.targetProduct.id,
        name: opp.targetProduct.name,
        image: opp.targetProduct.image,
        price: opp.targetPrice,
        currency: opp.targetCurrency,
        platform: {
          id: opp.targetProduct.platform.id,
          name: opp.targetProduct.platform.name,
          logo: opp.targetProduct.platform.logo,
        },
      },
      profit: opp.profit,
      profitPercentage: opp.profitPercentage,
      isTracked: session?.user ? trackedOpportunityIds.has(opp.id) : false,
      createdAt: opp.createdAt,
      updatedAt: opp.updatedAt,
    }));

    return successResponse({
      opportunities: formattedOpportunities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}