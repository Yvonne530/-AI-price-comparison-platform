'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'trends', name: '市场趋势', count: 12 },
  { id: 'guides', name: '购物指南', count: 15 },
  { id: 'tips', name: '省钱技巧', count: 8 },
  { id: 'platforms', name: '平台对比', count: 6 },
  { id: 'reviews', name: '商品评测', count: 10 },
];

export function BlogCategories() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  return (
    <Card>
      <CardHeader>
        <CardTitle>文章分类</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1">
          <Link
            href="/blog"
            className={cn(
              'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
              !currentCategory && 'bg-muted'
            )}
          >
            <span>全部文章</span>
            <span className="text-muted-foreground text-sm">
              {categories.reduce((acc, cat) => acc + cat.count, 0)}
            </span>
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog?category=${category.id}`}
              className={cn(
                'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                currentCategory === category.id && 'bg-muted'
              )}
            >
              <span>{category.name}</span>
              <span className="text-muted-foreground text-sm">
                {category.count}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}