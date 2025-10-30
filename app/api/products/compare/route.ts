import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const compareParamsSchema = z.object({
  ids: z.string().transform(str => str.split(',')).refine(
    ids => ids.length >= 2 && ids.length <= 4,
    '请选择2-4个产品进行比较'
  ),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { ids } = compareParamsSchema.parse(Object.fromEntries(searchParams));
    const userId = request.headers.get('X-User-Id');

    // 获取产品信息
    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        prices: {
          orderBy: { price: 'asc' },
        },
      },
    });

    if (products.length !== ids.length) {
      return errorResponse('部分产品不存在', 404);
    }

    // 如果用户已登录，记录比较历史
    if (userId) {
      await prisma.comparison.create({
        data: {
          userId,
          products: {
            connect: ids.map(id => ({ id })),
          },
        },
      });
    }

    // 格式化响应数据
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      category: product.category,
      brand: product.brand,
      model: product.model,
      prices: product.prices.map(price => ({
        price: price.price,
        currency: price.currency,
        platform: price.platform,
        url: price.url,
        inStock: price.inStock,
      })),
      bestPrice: product.prices[0]?.price,
      bestPricePlatform: product.prices[0]?.platform,
      priceRange: product.prices.length > 1
        ? {
            min: product.prices[0].price,
            max: product.prices[product.prices.length - 1].price,
            difference: product.prices[product.prices.length - 1].price - product.prices[0].price,
          }
        : null,
    }));

    // 计算价格差异
    const priceDifferences = formattedProducts.map((product, index) => {
      if (index === 0) return null;
      const priceDiff = product.bestPrice - formattedProducts[0].bestPrice;
      const percentageDiff = (priceDiff / formattedProducts[0].bestPrice) * 100;
      return {
        absolute: priceDiff,
        percentage: percentageDiff,
      };
    });

    return successResponse({
      products: formattedProducts,
      priceDifferences,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}