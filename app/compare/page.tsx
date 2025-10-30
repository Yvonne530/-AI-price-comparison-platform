import { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareProducts } from './compare-products';
import { CompareHistory } from './compare-history';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export const metadata: Metadata = {
  title: '商品比较 - AI价格比较平台',
  description: '对比不同平台的商品价格、配送和评价信息',
};

interface ComparePageProps {
  searchParams: {
    products?: string; // 逗号分隔的产品ID列表
  };
}

export default function ComparePage({ searchParams }: ComparePageProps) {
  const productIds = searchParams.products?.split(',').filter(Boolean) || [];

  return (
    <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">商品比较</h1>
      </div>

      <div className="space-y-8">
        <Suspense fallback={<PageSkeleton type="grid" />}>
          <CompareProducts productIds={productIds} />
        </Suspense>

        {productIds.length === 0 && (
          <Suspense fallback={<PageSkeleton type="list" />}>
            <CompareHistory />
          </Suspense>
        )}
      </div>
    </main>
  );
}