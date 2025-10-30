import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const checkoutSchema = z.object({
  planId: z.string(),
});

// 创建支付结账会话
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const body = await request.json();
    const { planId } = checkoutSchema.parse(body);

    // 获取订阅计划
    const plan = await prisma.subscriptionPlan.findUnique({
      where: {
        id: planId,
        active: true,
      },
    });

    if (!plan) {
      return errorResponse('订阅计划不存在', 404);
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return errorResponse('用户不存在', 404);
    }

    // 确保用户有Stripe客户ID
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: session.user.id,
        },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId },
      });
    }

    // 创建结账会话
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/plans`,
      metadata: {
        userId: session.user.id,
        planId: plan.id,
      },
    });

    return successResponse({
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    return handleApiError(error);
  }
}