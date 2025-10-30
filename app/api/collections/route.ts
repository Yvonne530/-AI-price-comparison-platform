import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const collectionParamsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

const collectionCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
});

// 获取用户集合列表
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = collectionParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const skip = (page - 1) * limit;

    // 获取集合列表
    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where: { userId: session.user.id },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.collection.count({
        where: { userId: session.user.id },
      }),
    ]);

    // 格式化响应数据
    const formattedCollections = collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isPublic: collection.isPublic,
      productCount: collection._count.products,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    }));

    return successResponse({
      collections: formattedCollections,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 创建新集合
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse('未登录', 401);
    }

    const body = await request.json();
    const data = collectionCreateSchema.parse(body);

    // 创建集合
    const collection = await prisma.collection.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    return successResponse({
      id: collection.id,
      message: '集合创建成功',
    });
  } catch (error) {
    return handleApiError(error);
  }
}