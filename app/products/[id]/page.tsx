import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiResponse, Product } from '@/types/api';

// 加载状态组件
function ProductSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <Skeleton className="h-[300px] w-[300px]" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

async function getProduct(id: string): Promise<ApiResponse<Product>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
    next: { revalidate: 60 }, // 1分钟缓存
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch product');
  }

  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: product } = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  // 按平台分组价格
  const pricesByPlatform = product.prices.reduce((acc, price) => {
    if (!acc[price.source]) {
      acc[price.source] = [];
    }
    acc[price.source].push(price);
    return acc;
  }, {} as Record<string, typeof product.prices>);

  return (
    <main className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<ProductSkeleton />}>
        <div className="flex gap-6">
          {/* 产品图片 */}
          <div className="relative h-[300px] w-[300px]">
            <Image
              src={product.imageUrl || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          {/* 产品信息 */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{product.name}</h1>
                {product.brand && (
                  <Badge variant="secondary" className="mt-2">
                    {product.brand}
                  </Badge>
                )}
              </div>
              <Button variant="outline">
                <span className="sr-only">收藏产品</span>
                ❤️
              </Button>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* 分类信息 */}
            {product.category && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">分类：</span>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* 价格矩阵 */}
        <Card>
          <CardHeader>
            <CardTitle>平台价格比较</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>平台</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>货币</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(pricesByPlatform).map(([platform, prices]) => {
                  const latestPrice = prices[0]; // 假设价格已按时间排序
                  return (
                    <TableRow key={platform}>
                      <TableCell className="font-medium">{platform}</TableCell>
                      <TableCell>{latestPrice.price}</TableCell>
                      <TableCell>{latestPrice.currency}</TableCell>
                      <TableCell>
                        {new Date(latestPrice.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(latestPrice.url, '_blank')}
                        >
                          去购买
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 价格历史图表 */}
        <Card>
          <CardHeader>
            <CardTitle>价格历史趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 这里可以使用 Chart.js 或其他图表库展示价格历史 */}
            <div className="h-[400px] w-full bg-muted rounded-lg flex items-center justify-center">
              价格历史图表
            </div>
          </CardContent>
        </Card>
      </Suspense>
    </main>
  );
}