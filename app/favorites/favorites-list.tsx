import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiResponse, Product } from '@/types/api';
import { FavoriteActions } from './favorite-actions';

async function getFavorites() {
  const response = await fetch('/api/user/favorites', {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('获取收藏列表失败');
  }

  const data: ApiResponse<Product[]> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || '获取收藏数据失败');
  }

  return data.data;
}

export async function FavoritesList() {
  try {
    const favorites = await getFavorites();

    if (favorites.length === 0) {
      return (
        <EmptyState
          title="暂无收藏商品"
          description="浏览商品并添加到收藏列表"
          action={
            <Button asChild>
              <Link href="/">开始浏览</Link>
            </Button>
          }
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((product) => (
          <Card key={product.id} className="h-full">
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
              <div className="space-y-2">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-medium hover:text-primary line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
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
                <FavoriteActions productId={product.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={error instanceof Error ? error : new Error('加载收藏失败')}
      />
    );
  }
}