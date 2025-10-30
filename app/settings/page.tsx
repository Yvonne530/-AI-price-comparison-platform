import { Metadata } from 'next';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { NotificationSettings } from './notification-settings';
import { SecuritySettings } from './security-settings';
import { PreferenceSettings } from './preference-settings';

export const metadata: Metadata = {
  title: '账户设置 - AI价格比较平台',
  description: '管理您的账户设置和偏好',
};

export default function SettingsPage() {
  return (
    <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">账户设置</h1>
      </div>

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">偏好设置</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <Suspense fallback={<PageSkeleton type="detail" />}>
            <PreferenceSettings />
          </Suspense>
        </TabsContent>

        <TabsContent value="notifications">
          <Suspense fallback={<PageSkeleton type="detail" />}>
            <NotificationSettings />
          </Suspense>
        </TabsContent>

        <TabsContent value="security">
          <Suspense fallback={<PageSkeleton type="detail" />}>
            <SecuritySettings />
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  );
}