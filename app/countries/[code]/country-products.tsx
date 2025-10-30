import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  platform: string;
  rating: number;
  reviewCount: number;
}

interface CountryProductsProps {
  code: string;
  category?: string;
  sort?: string;
  page: number;
}

async function getCountryProducts(
  code: string,
  category?: string,
  sort?: string,
  page: number = 1
) {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(category && { category }),
    ...(sort && { sort }),
  });

  const response = await fetch(
    `/api/countries/${code}/products?${params.toString()}`,
    {
      next: { revalidate: 300 }, // 5分钟缓存
    }
  );

  if (!response.ok) {
    throw new Error('获取商品列表失败');
  }

  const data: ApiResponse<{
    products: Product[];
    total: number;
    totalPages: number;
  }> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || '加载商品失败');
  }

  return data.data;
}

const categories = [
  { value: 'all', label: '全部分类' },
  { value: 'electronics', label: '电子产品' },
  { value: 'fashion', label: '服饰鞋包' },
  { value: 'beauty', label: '美妆个护' },
  { value: 'home', label: '家居生活' },
];

const sortOptions = [
  { value: 'popular', label: '最受欢迎' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'rating', label: '评分最高' },
  { value: 'newest', label: '最新上架' },
];

export async function CountryProducts({
  code,
  category,
  sort,
  page,
}: CountryProductsProps) {
  try {
    const { products, total, totalPages } = await getCountryProducts(
      code,
      category,
      sort,
      page
    );

    if (products.length === 0) {
      return (
        <EmptyState
          title="暂无商品"
          description="该分类下暂时没有商品"
          action={
            <Button variant="outline" asChild>
              <Link href={`/countries/${code}`}>查看全部商品</Link>
            </Button>
          }
        />
      );
    }

    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Select
              defaultValue={category || 'all'}
              onValueChange={(value) =>
                window.location.href = `/countries/${code}?${new URLSearchParams({
                  category: value,
                  ...(sort && { sort }),
                })}`
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              defaultValue={sort || 'popular'}
              onValueChange={(value) =>
                window.location.href = `/countries/${code}?${new URLSearchParams({
                  ...(category && { category }),
                  sort: value,
                })}`
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
          </div>

          <p className="text-sm text-muted-foreground">
            共 {total} 件商品
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2 text-base">
                  <Link
                    href={`/products/${product.id}`}
                    className="hover:text-primary"
                  >
                    {product.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">
                    {product.currency} {product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {product.platform}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>★ {product.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{product.reviewCount} 条评价</span>
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
                  href={`/countries/${code}?${new URLSearchParams({
                    ...(category && { category }),
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
                  href={`/countries/${code}?${new URLSearchParams({
                    ...(category && { category }),
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
        error={error instanceof Error ? error : new Error('加载商品失败')}
      />
    );
  }
}