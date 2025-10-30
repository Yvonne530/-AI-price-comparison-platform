import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';

const platformParamsSchema = z.object({
  countryId: z.string().optional(),
});

// 获取支持的平台列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { countryId } = platformParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    const platforms = await prisma.platform.findMany({
      where: {
        active: true,
        ...(countryId && { countryId }),
      },
      select: {
        id: true,
        name: true,
        logo: true,
        website: true,
        country: {
          select: {
            code: true,
            name: true,
            flag: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [
        { country: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    // 格式化响应数据
    const formattedPlatforms = platforms.map(platform => ({
      id: platform.id,
      name: platform.name,
      logo: platform.logo,
      website: platform.website,
      country: platform.country,
      productCount: platform._count.products,
    }));

    return successResponse(formattedPlatforms);
  } catch (error) {
    return handleApiError(error);
  }
}