'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'electronics', name: '电子产品', count: 0 },
  { id: 'fashion', name: '服饰鞋包', count: 0 },
  { id: 'beauty', name: '美妆个护', count: 0 },
  { id: 'home', name: '家居生活', count: 0 },
];

const platforms = [
  { id: 'amazon', name: '亚马逊', count: 0 },
  { id: 'ebay', name: 'eBay', count: 0 },
  { id: 'aliexpress', name: '全球速卖通', count: 0 },
  { id: 'walmart', name: '沃尔玛', count: 0 },
];

const countries = [
  { id: 'us', name: '美国', count: 0 },
  { id: 'uk', name: '英国', count: 0 },
  { id: 'de', name: '德国', count: 0 },
  { id: 'jp', name: '日本', count: 0 },
];

const discountRanges = [
  { value: '10', label: '10%以上' },
  { value: '20', label: '20%以上' },
  { value: '30', label: '30%以上' },
  { value: '50', label: '50%以上' },
  { value: '70', label: '70%以上' },
];

export function DealsFilters() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const currentPlatform = searchParams.get('platform');
  const currentCountry = searchParams.get('country');
  const currentDiscount = searchParams.get('minDiscount');

  const createFilterUrl = (
    param: string,
    value: string | null,
    exclude: string[] = []
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }
    exclude.forEach((key) => params.delete(key));
    return `/deals?${params.toString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>筛选条件</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-6">
          {/* 商品分类 */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium mb-2 px-3">商品分类</h3>
            <Link
              href="/deals"
              className={cn(
                'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                !currentCategory && 'bg-muted'
              )}
            >
              <span>全部分类</span>
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={createFilterUrl('category', category.id)}
                className={cn(
                  'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                  currentCategory === category.id && 'bg-muted'
                )}
              >
                <span>{category.name}</span>
                {category.count > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {category.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* 电商平台 */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium mb-2 px-3">电商平台</h3>
            <Link
              href={createFilterUrl('platform', null)}
              className={cn(
                'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                !currentPlatform && 'bg-muted'
              )}
            >
              <span>全部平台</span>
            </Link>
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                href={createFilterUrl('platform', platform.id)}
                className={cn(
                  'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                  currentPlatform === platform.id && 'bg-muted'
                )}
              >
                <span>{platform.name}</span>
                {platform.count > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {platform.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* 国家/地区 */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium mb-2 px-3">国家/地区</h3>
            <Link
              href={createFilterUrl('country', null)}
              className={cn(
                'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                !currentCountry && 'bg-muted'
              )}
            >
              <span>全部地区</span>
            </Link>
            {countries.map((country) => (
              <Link
                key={country.id}
                href={createFilterUrl('country', country.id)}
                className={cn(
                  'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                  currentCountry === country.id && 'bg-muted'
                )}
              >
                <span>{country.name}</span>
                {country.count > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {country.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* 折扣力度 */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium mb-2 px-3">折扣力度</h3>
            <Link
              href={createFilterUrl('minDiscount', null)}
              className={cn(
                'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                !currentDiscount && 'bg-muted'
              )}
            >
              <span>全部折扣</span>
            </Link>
            {discountRanges.map((range) => (
              <Link
                key={range.value}
                href={createFilterUrl('minDiscount', range.value)}
                className={cn(
                  'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                  currentDiscount === range.value && 'bg-muted'
                )}
              >
                <span>{range.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}