import { Metadata } from 'next';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { AboutContent } from './about-content';
import { HelpContent } from './help-content';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: '关于我们 - AI价格比较平台',
  description: '了解我们的平台和获取帮助',
};

export default function AboutPage() {
  return (
    <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">关于我们</h1>
      </div>

      <Tabs defaultValue="about" className="space-y-4">
        <TabsList>
          <TabsTrigger value="about">平台介绍</TabsTrigger>
          <TabsTrigger value="help">帮助中心</TabsTrigger>
          <TabsTrigger value="contact">联系我们</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Suspense fallback={<PageSkeleton type="detail" />}>
            <AboutContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="help">
          <Suspense fallback={<PageSkeleton type="detail" />}>
            <HelpContent />
          </Suspense>
        </TabsContent>

        <TabsContent value="contact">
          <ContactForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}