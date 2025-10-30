import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from './search-results';
import { SearchFilters } from './search-filters';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export const metadata: Metadata = {
  title: '搜索结果 - AI价格比较平台',
  description: '查看跨平台商品价格比较结果',
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    platform?: string;
    country?: string;
    sort?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const hasQuery = searchParams.q && searchParams.q.length > 0;

  return (
    <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 flex-shrink-0">
          <SearchFilters
            initialFilters={{
              minPrice: searchParams.minPrice,
              maxPrice: searchParams.maxPrice,
              platform: searchParams.platform,
              country: searchParams.country,
              sort: searchParams.sort,
            }}
          />
        </aside>
        <div className="flex-1">
          {hasQuery ? (
            <Suspense fallback={<PageSkeleton type="list" />}>
              <SearchResults searchParams={searchParams} />
            </Suspense>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">请输入搜索关键词</h2>
              <p className="text-muted-foreground">
                在上方搜索框输入商品名称或关键词开始搜索
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}