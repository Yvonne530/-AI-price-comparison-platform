import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiResponse } from '@/types/api';

interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  prices: {
    platform: string;
    price: number;
    currency: string;
    shipping: number;
    stock: number;
    rating: number;
    reviewCount: number;
    link: string;
  }[];
  specifications: Record<string, string>;
}

interface CompareProductsProps {
  productIds: string[];
}

async function getProductsForComparison(productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  // 使用mock数据而不是真实的API调用
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro 128GB',
      image: '/placeholder.svg?height=200&width=200&text=iPhone+15+Pro',
      description: 'Apple最新旗舰手机，配备A17 Pro芯片',
      prices: [
        {
          platform: 'Apple Store',
          price: 7999,
          currency: '¥',
          shipping: 0,
          stock: 10,
          rating: 4.8,
          reviewCount: 1245,
          link: 'https://apple.com'
        },
        {
          platform: '京东',
          price: 7499,
          currency: '¥',
          shipping: 0,
          stock: 5,
          rating: 4.6,
          reviewCount: 876,
          link: 'https://jd.com'
        },
        {
          platform: '天猫',
          price: 7599,
          currency: '¥',
          shipping: 0,
          stock: 8,
          rating: 4.7,
          reviewCount: 1123,
          link: 'https://tmall.com'
        }
      ],
      specifications: {
        '屏幕尺寸': '6.1英寸',
        '存储容量': '128GB',
        '摄像头': '48MP主摄',
        '电池容量': '3274mAh',
        '重量': '187g'
      }
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24',
      image: '/placeholder.svg?height=200&width=200&text=Galaxy+S24',
      description: '三星旗舰手机，搭载骁龙8 Gen 3处理器',
      prices: [
        {
          platform: 'Samsung Store',
          price: 6999,
          currency: '¥',
          shipping: 0,
          stock: 15,
          rating: 4.7,
          reviewCount: 987,
          link: 'https://samsung.com'
        },
        {
          platform: '京东',
          price: 6499,
          currency: '¥',
          shipping: 0,
          stock: 12,
          rating: 4.5,
          reviewCount: 754,
          link: 'https://jd.com'
        },
        {
          platform: '天猫',
          price: 6599,
          currency: '¥',
          shipping: 0,
          stock: 9,
          rating: 4.6,
          reviewCount: 832,
          link: 'https://tmall.com'
        }
      ],
      specifications: {
        '屏幕尺寸': '6.2英寸',
        '存储容量': '128GB',
        '摄像头': '50MP主摄',
        '电池容量': '4000mAh',
        '重量': '164g'
      }
    }
  ];

  return mockProducts;
  
  /*
  // 保留原始代码以备将来使用
  const response = await fetch(
    `/api/products/compare?${new URLSearchParams({
      ids: productIds.join(','),
    })}`,
    {
      next: { revalidate: 60 }, // 1分钟缓存
    }
  );

  if (!response.ok) {
    throw new Error('获取商品比较信息失败');
  }

  const data: ApiResponse<Product[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || '加载商品信息失败');
  }

  return data.data;
  */
}

export async function CompareProducts({ productIds }: CompareProductsProps) {
  if (productIds.length === 0) {
    return (
      <EmptyState
        title="开始比较"
        description="请从商品详情页添加商品进行比较"
        action={
          <Button variant="outline" asChild>
            <Link href="/search">浏览商品</Link>
          </Button>
        }
      />
    );
  }

  try {
    const products = await getProductsForComparison(productIds);

    if (products.length === 0) {
      return (
        <EmptyState
          title="未找到商品"
          description="无法找到指定的商品信息"
          action={
            <Button variant="outline" asChild>
              <Link href="/search">浏览商品</Link>
            </Button>
          }
        />
      );
    }

    // 获取所有产品共有的规格项
    const commonSpecs = Object.keys(products[0].specifications).filter((spec) =>
      products.every((product) => spec in product.specifications)
    );

    return (
      <div className="space-y-8">
        {/* 基本信息比较 */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="space-y-4">
                  <div className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="font-medium">{product.name}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 价格比较 */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">价格对比</h2>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id}>
                  <h3 className="font-medium mb-2">{product.name}</h3>
                  <div className="space-y-3">
                    {product.prices
                      .sort((a, b) => a.price + a.shipping - (b.price + b.shipping))
                      .map((price, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <div className="font-medium mb-1">
                              {price.platform}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ★ {price.rating.toFixed(1)} ({price.reviewCount}
                              条评价)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {price.currency}{' '}
                              {(price.price + price.shipping).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              商品价格：{price.currency}{' '}
                              {price.price.toLocaleString()} + 运费：
                              {price.currency} {price.shipping.toLocaleString()}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={price.link} target="_blank">
                              去购买
                            </Link>
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 规格比较 */}
        {commonSpecs.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">规格参数</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium">参数</th>
                      {products.map((product) => (
                        <th
                          key={product.id}
                          className="text-left py-2 px-4 font-medium"
                        >
                          {product.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commonSpecs.map((spec) => (
                      <tr key={spec} className="border-b">
                        <td className="py-2 px-4 text-muted-foreground">
                          {spec}
                        </td>
                        {products.map((product) => (
                          <td key={product.id} className="py-2 px-4">
                            {product.specifications[spec]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={error instanceof Error ? error : new Error('加载比较信息失败')}
      />
    );
  }
}