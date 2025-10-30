import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiResponse } from '@/types/api';

interface Deal {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  currency: string;
  platform: string;
  country: string;
  discountPercentage: number;
  endsAt: string;
  stock: number;
}

interface DealsListProps {
  category?: string;
  platform?: string;
  country?: string;
  minDiscount?: number;
  sort?: string;
  page: number;
}

async function getDeals({
  category,
  platform,
  country,
  minDiscount,
  sort = 'discount',
  page = 1,
}: DealsListProps) {
  const params = new URLSearchParams({
    page: page.toString(),
    sort,
    ...(category && { category }),
    ...(platform && { platform }),
    ...(country && { country }),
    ...(minDiscount && { minDiscount: minDiscount.toString() }),
  });

  const response = await fetch(`/api/deals?${params.toString()}`, {
    next: { revalidate: 300 }, // 5分钟缓存
  });

  if (!response.ok) {
    throw new Error('获取特价商品列表失败');
  }

  const data: ApiResponse<{
    deals: Deal[];
    total: number;
    totalPages: number;
  }> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || '加载特价商品失败');
  }

  return data.data;
}

const sortOptions = [
  { value: 'discount', label: '折扣力度' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'ending_soon', label: '即将结束' },
  { value: 'newest', label: '最新上架' },
];

export async function DealsList({
  category,
  platform,
  country,
  minDiscount,
  sort,
  page,
}: DealsListProps) {
  try {
    const { deals, total, totalPages } = await getDeals({
      category,
      platform,
      country,
      minDiscount,
      sort,
      page,
    });

    if (deals.length === 0) {
      return (
        <EmptyState
          title="暂无特价"
          description="没有找到符合条件的特价商品"
          action={
            <Button variant="outline" asChild>
              <Link href="/deals">查看全部特价</Link>
            </Button>
          }
        />
      );
    }

    const createSortUrl = (newSort: string) => {
      const params = new URLSearchParams({
        ...(category && { category }),
        ...(platform && { platform }),
        ...(country && { country }),
        ...(minDiscount && { minDiscount: minDiscount.toString() }),
        sort: newSort,
      });
      return `/deals?${params.toString()}`;
    };

    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Select
            defaultValue={sort || 'discount'}
            onValueChange={(value) =>
              (window.location.href = createSortUrl(value))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-sm text-muted-foreground">
            共 {total} 件特价商品
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={deal.productImage}
                  alt={deal.productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                  -{deal.discountPercentage}%
                </div>
              </div>
              <CardHeader className="space-y-2">
                <Link
                  href={`/products/${deal.productId}`}
                  className="hover:text-primary"
                >
                  <h3 className="font-medium line-clamp-2">
                    {deal.productName}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {deal.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold">
                      {deal.currency} {deal.discountPrice.toLocaleString()}
                    </span>
                    <span className="text-sm line-through text-muted-foreground">
                      {deal.currency} {deal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{deal.platform}</span>
                    <span>{deal.country}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(deal.endsAt).toLocaleDateString('zh-CN')} 结束
                    </span>
                    {deal.stock <= 10 && (
                      <span className="text-sm text-red-500">
                        仅剩 {deal.stock} 件
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Button
                variant="outline"
                asChild
              >
                <Link
                  href={`/deals?${new URLSearchParams({
                    ...(category && { category }),
                    ...(platform && { platform }),
                    ...(country && { country }),
                    ...(minDiscount && {
                      minDiscount: minDiscount.toString(),
                    }),
                    ...(sort && { sort }),
                    page: (page - 1).toString(),
                  })}`}
                >
                  上一页
                </Link>
              </Button>
            )}
            <span className="flex items-center px-4 text-muted-foreground">
              第 {page} 页，共 {totalPages} 页
            </span>
            {page < totalPages && (
              <Button
                variant="outline"
                asChild
              >
                <Link
                  href={`/deals?${new URLSearchParams({
                    ...(category && { category }),
                    ...(platform && { platform }),
                    ...(country && { country }),
                    ...(minDiscount && {
                      minDiscount: minDiscount.toString(),
                    }),
                    ...(sort && { sort }),
                    page: (page + 1).toString(),
                  })}`}
                >
                  下一页
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={error instanceof Error ? error : new Error('加载特价商品失败')}
      />
    );
  }
}