import { Metadata } from 'next';
import { PricingPlans } from './pricing-plans';
import { PricingFeatures } from './pricing-features';
import { PricingFAQ } from './pricing-faq';

export const metadata: Metadata = {
  title: '订阅计划 - AI价格比较平台',
  description: '选择最适合您的订阅计划，开启智能跨境比价之旅',
};

export default function PricingPage() {
  return (
    <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">选择您的订阅计划</h1>
        <p className="text-xl text-muted-foreground">
          灵活的定价方案，满足不同需求
        </p>
      </div>

      <PricingPlans />

      <div className="mt-24">
        <PricingFeatures />
      </div>

      <div className="mt-24">
        <PricingFAQ />
      </div>
    </main>
  );
}