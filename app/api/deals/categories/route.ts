import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';

// 获取优惠分类列表
export async function GET() {
  try {
    // 获取所有活跃的优惠分类
    const categories = await prisma.dealCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { deals: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    // 格式化响应数据
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      dealCount: category._count.deals,
    }));

    return successResponse(formattedCategories);
  } catch (error) {
    return handleApiError(error);
  }
}