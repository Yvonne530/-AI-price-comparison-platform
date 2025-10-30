import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';

const helpParamsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  category: z.string().optional(),
  keyword: z.string().optional(),
});

// 获取帮助文档列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, category, keyword } = helpParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = {
      ...(category && { category }),
      ...(keyword && {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      }),
      published: true,
    };

    // 获取文档列表
    const [articles, total] = await Promise.all([
      prisma.helpArticle.findMany({
        where,
        select: {
          id: true,
          title: true,
          summary: true,
          category: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.helpArticle.count({ where }),
    ]);

    return successResponse({
      articles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}