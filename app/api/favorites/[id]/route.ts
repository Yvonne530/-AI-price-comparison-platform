import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

// 删除收藏
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const favoriteId = params.id;

    // 检查收藏是否存在且属于当前用户
    const favorite = await prisma.favorite.findFirst({
      where: {
        id: favoriteId,
        userId: session.user.id,
      },
    });

    if (!favorite) {
      return errorResponse('收藏不存在或无权限删除', 404);
    }

    // 删除收藏
    await prisma.favorite.delete({
      where: { id: favoriteId },
    });

    return successResponse({
      message: '已从收藏中移除',
    });
  } catch (error) {
    return handleApiError(error);
  }
}