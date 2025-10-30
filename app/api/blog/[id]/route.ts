import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

// 获取单篇博客文章
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        id: params.id,
        published: true,
      },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { views: true },
        },
      },
    });

    if (!post) {
      return errorResponse('文章不存在', 404);
    }

    // 增加浏览次数
    await prisma.blogPostView.create({
      data: {
        postId: post.id,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '未知IP',
      },
    });

    // 格式化响应数据
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      summary: post.summary,
      category: post.category,
      author: post.author,
      viewCount: post._count.views,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    return successResponse(formattedPost);
  } catch (error) {
    return handleApiError(error);
  }
}