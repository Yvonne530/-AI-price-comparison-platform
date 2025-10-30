import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';

// 获取博客分类列表
export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        posts: { _count: 'desc' },
      },
    });

    // 格式化响应数据
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      postCount: category._count.posts,
    }));

    return successResponse(formattedCategories);
  } catch (error) {
    return handleApiError(error);
  }
}