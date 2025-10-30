import { Metadata } from 'next';
import { Suspense } from 'react';
import { DealsList } from './deals-list';
import { DealsFilters } from './deals-filters';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export const metadata: Metadata = {
  title: '特价商品 - AI价格比较平台',
  description: '发现全球各大电商平台的特价商品和限时优惠',
};

interface DealsPageProps {
  searchParams: {
    category?: string;
    platform?: string;
    country?: string;
    minDiscount?: string;
    sort?: string;
    page?: string;
  };
}

export default function DealsPage({ searchParams }: DealsPageProps) {
  return (
    <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">特价商品</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 flex-shrink-0">
          <DealsFilters />
        </aside>
        <div className="flex-1">
          <Suspense fallback={<PageSkeleton type="grid" />}>
            <DealsList
              category={searchParams.category}
              platform={searchParams.platform}
              country={searchParams.country}
              minDiscount={
                searchParams.minDiscount
                  ? parseInt(searchParams.minDiscount)
                  : undefined
              }
              sort={searchParams.sort}
              page={searchParams.page ? parseInt(searchParams.page) : 1}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}