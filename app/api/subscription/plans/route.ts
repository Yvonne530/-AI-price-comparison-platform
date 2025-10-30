import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';

// 获取可用的订阅计划列表
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        interval: true,
        features: true,
        stripeProductId: true,
        stripePriceId: true,
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { price: 'asc' },
    });

    // 格式化响应数据
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      subscriberCount: plan._count.subscriptions,
    }));

    return successResponse(formattedPlans);
  } catch (error) {
    return handleApiError(error);
  }
}