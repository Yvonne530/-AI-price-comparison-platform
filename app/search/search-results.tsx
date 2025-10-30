import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiResponse, Product } from '@/types/api';

interface SearchResultsProps {
  searchParams: {
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    platform?: string;
    country?: string;
    sort?: string;
  };
}

async function getSearchResults(searchParams: SearchResultsProps['searchParams']) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const response = await fetch(`/api/products/search?${params.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('搜索请求失败');
  }

  const data: ApiResponse<Product[]> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || '获取搜索结果失败');
  }

  return data.data;
}

export async function SearchResults({ searchParams }: SearchResultsProps) {
  try {
    const products = await getSearchResults(searchParams);

    if (products.length === 0) {
      return (
        <EmptyState
          title="未找到相关商品"
          description="请尝试调整搜索关键词或筛选条件"
          action={
            <Button variant="outline" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            搜索结果：{searchParams.q}
          </h2>
          <p className="text-muted-foreground">
            共找到 {products.length} 个商品
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square relative mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <h3 className="font-medium mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold">
                      ${product.prices[0].amount}
                    </span>
                    <Badge variant="secondary">
                      {product.prices[0].platform}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={error instanceof Error ? error : new Error('搜索失败')}
      />
    );
  }
}