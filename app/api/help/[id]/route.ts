import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

// 获取单篇帮助文档
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.helpArticle.findUnique({
      where: {
        id: params.id,
        published: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!article) {
      return errorResponse('文档不存在', 404);
    }

    return successResponse(article);
  } catch (error) {
    return handleApiError(error);
  }
}