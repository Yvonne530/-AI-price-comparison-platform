import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiResponse } from '@/types/api';

interface Deal {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  discountPrice: number;
  currency: string;
  platform: string;
  discountPercentage: number;
  endsAt: string;
}

interface CountryDealsProps {
  code: string;
}

async function getCountryDeals(code: string) {
  const response = await fetch(`/api/countries/${code}/deals`, {
    next: { revalidate: 300 }, // 5分钟缓存
  });

  if (!response.ok) {
    throw new Error('获取特价商品列表失败');
  }

  const data: ApiResponse<Deal[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || '加载特价商品失败');
  }

  return data.data;
}

export async function CountryDeals({ code }: CountryDealsProps) {
  try {
    const deals = await getCountryDeals(code);

    if (deals.length === 0) {
      return (
        <EmptyState
          title="暂无特价"
          description="该国家/地区暂时没有特价商品"
        />
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>特价商品</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={deal.productImage}
                    alt={deal.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${deal.productId}`}
                    className="hover:text-primary"
                  >
                    <h3 className="font-medium mb-2 line-clamp-2">
                      {deal.productName}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-semibold">
                      {deal.currency} {deal.discountPrice.toLocaleString()}
                    </span>
                    <span className="text-sm line-through text-muted-foreground">
                      {deal.currency} {deal.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-red-500">
                      -{deal.discountPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {deal.platform}
                    </span>
                    <span className="text-muted-foreground">
                      结束时间：
                      {new Date(deal.endsAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link href={`/deals?country=${code}`}>
                查看更多特价商品
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={error instanceof Error ? error : new Error('加载特价商品失败')}
      />
    );
  }
}