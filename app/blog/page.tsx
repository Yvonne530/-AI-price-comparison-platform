import { Metadata } from 'next';
import { Suspense } from 'react';
import { BlogList } from './blog-list';
import { BlogCategories } from './blog-categories';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export const metadata: Metadata = {
  title: '跨境购物博客 - AI价格比较平台',
  description: '了解最新的跨境购物趋势、市场分析和购物指南',
};

interface BlogPageProps {
  searchParams: {
    category?: string;
    page?: string;
  };
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">跨境购物博客</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 flex-shrink-0">
          <BlogCategories />
        </aside>
        <div className="flex-1">
          <Suspense fallback={<PageSkeleton type="list" />}>
            <BlogList
              category={searchParams.category}
              page={searchParams.page ? parseInt(searchParams.page) : 1}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}