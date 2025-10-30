import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const trackArbitrageSchema = z.object({
  opportunityId: z.string(),
});

// 跟踪套利机会
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const body = await request.json();
    const { opportunityId } = trackArbitrageSchema.parse(body);

    // 检查套利机会是否存在
    const opportunity = await prisma.arbitrageOpportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      return errorResponse('套利机会不存在', 404);
    }

    // 检查是否已经跟踪
    const existingTracking = await prisma.arbitrageTracking.findFirst({
      where: {
        userId: session.user.id,
        arbitrageOpportunityId: opportunityId,
      },
    });

    if (existingTracking) {
      return errorResponse('已经跟踪此套利机会', 400);
    }

    // 创建跟踪记录
    await prisma.arbitrageTracking.create({
      data: {
        userId: session.user.id,
        arbitrageOpportunityId: opportunityId,
      },
    });

    return successResponse({
      message: '套利机会跟踪成功',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 取消跟踪套利机会
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');

    if (!opportunityId) {
      return errorResponse('缺少套利机会ID', 400);
    }

    // 删除跟踪记录
    await prisma.arbitrageTracking.deleteMany({
      where: {
        userId: session.user.id,
        arbitrageOpportunityId: opportunityId,
      },
    });

    return successResponse({
      message: '已取消跟踪套利机会',
    });
  } catch (error) {
    return handleApiError(error);
  }
}