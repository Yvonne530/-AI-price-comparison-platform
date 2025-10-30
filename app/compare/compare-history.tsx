import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiResponse } from '@/types/api';

interface CompareRecord {
  id: string;
  products: {
    id: string;
    name: string;
    image: string;
    bestPrice: {
      price: number;
      currency: string;
      platform: string;
    };
  }[];
  createdAt: string;
}

async function getCompareHistory() {
  const response = await fetch('/api/user/compare-history');

  if (!response.ok) {
    throw new Error('获取比较历史失败');
  }

  const data: ApiResponse<CompareRecord[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || '加载比较历史失败');
  }

  return data.data;
}

export async function CompareHistory() {
  try {
    const history = await getCompareHistory();

    if (history.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>比较历史</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="暂无历史记录"
              description="您还没有进行过商品比较"
              action={
                <Button variant="outline" asChild>
                  <Link href="/search">浏览商品</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>比较历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <time className="text-sm text-muted-foreground">
                    {new Date(record.createdAt).toLocaleString('zh-CN')}
                  </time>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/compare?products=${record.products
                        .map((p) => p.id)
                        .join(',')}`}
                    >
                      重新比较
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {record.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-start gap-3"
                    >
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${product.id}`}
                          className="hover:text-primary"
                        >
                          <h3 className="font-medium line-clamp-2 mb-1">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          最低价：{product.bestPrice.currency}{' '}
                          {product.bestPrice.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          平台：{product.bestPrice.platform}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={error instanceof Error ? error : new Error('加载比较历史失败')}
      />
    );
  }
}