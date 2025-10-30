import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';

// 获取支持的国家列表
export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { active: true },
      select: {
        id: true,
        code: true,
        name: true,
        flag: true,
        currency: true,
        _count: {
          select: { platforms: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // 格式化响应数据
    const formattedCountries = countries.map(country => ({
      id: country.id,
      code: country.code,
      name: country.name,
      flag: country.flag,
      currency: country.currency,
      platformCount: country._count.platforms,
    }));

    return successResponse(formattedCountries);
  } catch (error) {
    return handleApiError(error);
  }
}