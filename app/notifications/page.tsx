import { Metadata } from 'next';
import { Suspense } from 'react';
import { NotificationList } from './notification-list';
import { NotificationFilters } from './notification-filters';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export const metadata: Metadata = {
  title: '通知中心 - AI价格比较平台',
  description: '查看您的价格提醒、特价通知和系统消息',
};

interface NotificationsPageProps {
  searchParams: {
    type?: string;
    status?: string;
    page?: string;
  };
}

export default function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  return (
    <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">通知中心</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 flex-shrink-0">
          <NotificationFilters />
        </aside>
        <div className="flex-1">
          <Suspense fallback={<PageSkeleton type="list" />}>
            <NotificationList
              type={searchParams.type}
              status={searchParams.status}
              page={searchParams.page ? parseInt(searchParams.page) : 1}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}