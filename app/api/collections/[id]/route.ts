import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const collectionUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

// 更新集合
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const collectionId = params.id;
    const body = await request.json();
    const data = collectionUpdateSchema.parse(body);

    // 检查集合是否存在且属于当前用户
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    });

    if (!collection) {
      return errorResponse('集合不存在或无权限修改', 404);
    }

    // 更新集合
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data,
    });

    return successResponse({
      ...updatedCollection,
      message: '集合更新成功',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 删除集合
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const collectionId = params.id;

    // 检查集合是否存在且属于当前用户
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    });

    if (!collection) {
      return errorResponse('集合不存在或无权限删除', 404);
    }

    // 删除集合及其关联的产品关系
    await prisma.$transaction([
      prisma.collectionProduct.deleteMany({
        where: { collectionId },
      }),
      prisma.collection.delete({
        where: { id: collectionId },
      }),
    ]);

    return successResponse({
      message: '集合已删除',
    });
  } catch (error) {
    return handleApiError(error);
  }
}