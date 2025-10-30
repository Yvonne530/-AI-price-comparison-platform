import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

// 获取单个平台详细信息
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const platform = await prisma.platform.findUnique({
      where: {
        id: params.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        logo: true,
        website: true,
        description: true,
        shippingInfo: true,
        paymentMethods: true,
        country: {
          select: {
            code: true,
            name: true,
            flag: true,
            currency: true,
          },
        },
        _count: {
          select: {
            products: true,
            priceAlerts: true,
            arbitrageOpportunities: true,
          },
        },
      },
    });

    if (!platform) {
      return errorResponse('平台不存在', 404);
    }

    // 格式化响应数据
    const formattedPlatform = {
      id: platform.id,
      name: platform.name,
      logo: platform.logo,
      website: platform.website,
      description: platform.description,
      shippingInfo: platform.shippingInfo,
      paymentMethods: platform.paymentMethods,
      country: platform.country,
      stats: {
        productCount: platform._count.products,
        alertCount: platform._count.priceAlerts,
        arbitrageCount: platform._count.arbitrageOpportunities,
      },
    };

    return successResponse(formattedPlatform);
  } catch (error) {
    return handleApiError(error);
  }
}