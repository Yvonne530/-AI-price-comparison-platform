import { Metadata } from 'next';
import { Suspense } from 'react';
import { FavoritesList } from './favorites-list';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export const metadata: Metadata = {
  title: '我的收藏 - AI价格比较平台',
  description: '管理您收藏的商品和价格提醒',
};

export default function FavoritesPage() {
  return (
    <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">我的收藏</h1>
      </div>
      <Suspense fallback={<PageSkeleton type="grid" />}>
        <FavoritesList />
      </Suspense>
    </main>
  );
}