import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const blogParamsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  category: z.string().optional(),
  sort: z.enum(['latest', 'popular']).optional(),
});

// 获取博客文章列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, category, sort } = blogParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = {
      ...(category && { category }),
      published: true,
    };

    // 获取文章列表
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          summary: true,
          category: true,
          author: {
            select: {
              name: true,
              avatar: true,
            },
          },
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { views: true },
          },
        },
        orderBy: sort === 'popular'
          ? { views: { _count: 'desc' } }
          : { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    // 格式化响应数据
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      summary: post.summary,
      category: post.category,
      author: post.author,
      viewCount: post._count.views,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return successResponse({
      posts: formattedPosts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}