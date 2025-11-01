import { z } from 'zod';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const searchParamsSchema = z.object({
  q: z.string().min(1, '请输入搜索关键词'),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  platform: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = searchParamsSchema.parse(Object.fromEntries(searchParams));
    const userId = request.headers.get('X-User-Id');

    // 构建查询参数
    const filters: any = {};
    if (params.category) filters.category = params.category;
    if (params.brand) filters.brand = params.brand;
    if (params.minPrice) filters.minPrice = params.minPrice;
    if (params.maxPrice) filters.maxPrice = params.maxPrice;
    if (params.platform) filters.platform = params.platform;

    // 调用 Express 服务器 API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3103'}/api/search`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchTerm: params.q,
        filters,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || '搜索请求失败');
    }

    // 格式化响应数据以匹配前端期望的格式
    const formattedProducts = data.data.results.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      category: product.category,
      brand: product.brand,
      model: '',
      bestPrice: product.price,
      currency: product.currency,
      platform: product.retailer,
      favoritesCount: 0,
    }));

    return successResponse({
      products: formattedProducts,
      total: data.data.count,
      page: 1,
      totalPages: 1,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
