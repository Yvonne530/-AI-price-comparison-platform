import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export function createValidationMiddleware<T extends z.ZodType>(schema: T) {
  return async function validationMiddleware(
    request: NextRequest,
    next: () => Promise<NextResponse>
  ) {
    try {
      const contentType = request.headers.get('content-type');
      let body;

      if (contentType?.includes('application/json')) {
        body = await request.json();
      } else if (contentType?.includes('multipart/form-data')) {
        const formData = await request.formData();
        body = Object.fromEntries(formData);
      } else if (request.method === 'GET') {
        const { searchParams } = new URL(request.url);
        body = Object.fromEntries(searchParams);
      }

      // 验证请求数据
      schema.parse(body);

      // 将验证后的数据附加到请求对象
      const validatedRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(body),
      });

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: '验证失败',
            details: error.errors,
          },
          { status: 400 }
        );
      }

      throw error;
    }
  };
}

// 常用的验证schema
export const commonSchemas = {
  // 分页参数验证
  pagination: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
  }),

  // 排序参数验证
  sorting: z.object({
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),

  // 日期范围验证
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  // 价格范围验证
  priceRange: z.object({
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
  }),

  // 搜索参数验证
  search: z.object({
    query: z.string().min(1).max(100),
    category: z.string().optional(),
    brand: z.string().optional(),
    platform: z.string().optional(),
  }),

  // ID验证
  id: z.object({
    id: z.string().uuid(),
  }),

  // 邮箱验证
  email: z.object({
    email: z.string().email(),
  }),

  // 密码验证
  password: z.object({
    password: z.string().min(8).max(100),
  }),
};