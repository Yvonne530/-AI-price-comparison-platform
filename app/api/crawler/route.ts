import { NextRequest } from 'next/server';
import { z } from 'zod';
import { crawlerManager } from '@/lib/services/crawler/manager';
import { createRateLimitMiddleware } from '@/middleware/rate-limit';
import { createValidationMiddleware } from '@/middleware/validation';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { auth } from '@/lib/auth';

// 创建爬虫请求的速率限制中间件
const rateLimitMiddleware = createRateLimitMiddleware({
  requests: 10,
  window: '1m',
  identifier: 'crawler',
});

// 验证schema
const searchSchema = z.object({
  keyword: z.string().min(1).max(100),
  platforms: z.array(z.enum(['JD', 'Taobao'])).optional(),
});

const productUrlSchema = z.object({
  url: z.string().url(),
});

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

// 搜索商品
export async function POST(request: NextRequest) {
  try {
    await rateLimitMiddleware(request);

    const validation = createValidationMiddleware(searchSchema);
    const { keyword, platforms } = await validation(request);

    const results = await crawlerManager.searchProducts(keyword, platforms);
    return successResponse({ results });
  } catch (error) {
    return handleApiError(error);
  }
}

// 获取商品信息
export async function GET(request: NextRequest) {
  try {
    await rateLimitMiddleware(request);

    const validation = createValidationMiddleware(productUrlSchema);
    const { url } = await validation(request);

    const product = await crawlerManager.getProductInfo(url);
    return successResponse({ product });
  } catch (error) {
    return handleApiError(error);
  }
}