import { NextRequest } from 'next/server';
import { z } from 'zod';
import { crawlerManager } from '@/lib/services/crawler/manager';
import { createRateLimitMiddleware } from '@/middleware/rate-limit';
import { createValidationMiddleware } from '@/middleware/validation';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { auth } from '@/lib/auth';

// 创建价格更新请求的速率限制中间件
const rateLimitMiddleware = createRateLimitMiddleware({
  requests: 5,
  window: '1m',
  identifier: 'price-update',
});

// 验证schema
const updatePriceSchema = z.object({
  productId: z.string().uuid(),
});

const batchUpdateSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(100),
});

const registerUpdateTaskSchema = z.object({
  productId: z.string().uuid(),
  interval: z.number().int().min(5).max(1440),
});

// 更新单个商品价格
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('未授权访问', 401);
    }

    await rateLimitMiddleware(request);

    const validation = createValidationMiddleware(updatePriceSchema);
    const { productId } = await validation(request);

    const result = await crawlerManager.updateProductPrice(productId);
    return successResponse({ result });
  } catch (error) {
    return handleApiError(error);
  }
}

// 批量更新商品价格
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('未授权访问', 401);
    }

    await rateLimitMiddleware(request);

    const validation = createValidationMiddleware(batchUpdateSchema);
    const { productIds } = await validation(request);

    const results = await crawlerManager.batchUpdatePrices(productIds);
    return successResponse({ results });
  } catch (error) {
    return handleApiError(error);
  }
}

// 注册定时更新任务
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('未授权访问', 401);
    }

    await rateLimitMiddleware(request);

    const validation = createValidationMiddleware(registerUpdateTaskSchema);
    const { productId, interval } = await validation(request);

    const result = await crawlerManager.registerUpdateTask(productId, interval);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// 取消定时更新任务
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return errorResponse('未授权访问', 401);
    }

    await rateLimitMiddleware(request);

    const validation = createValidationMiddleware(updatePriceSchema);
    const { productId } = await validation(request);

    const result = await crawlerManager.unregisterUpdateTask(productId);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}