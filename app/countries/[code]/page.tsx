import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CountryHeader } from './country-header';
import { CountryProducts } from './country-products';
import { CountryPlatforms } from './country-platforms';
import { CountryDeals } from './country-deals';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import { ApiResponse } from '@/types/api';

interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  description: string;
}

interface CountryPageProps {
  params: {
    code: string;
  };
  searchParams: {
    category?: string;
    sort?: string;
    page?: string;
  };
}

async function getCountryInfo(code: string): Promise<CountryInfo> {
  const response = await fetch(`/api/countries/${code}`, {
    next: { revalidate: 3600 }, // 1小时缓存
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error('获取国家信息失败');
  }

  const data: ApiResponse<CountryInfo> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || '加载国家信息失败');
  }

  return data.data;
}

export async function generateMetadata({
  params,
}: CountryPageProps): Promise<Metadata> {
  try {
    const countryInfo = await getCountryInfo(params.code);
    return {
      title: `${countryInfo.name}跨境购物指南 - AI价格比较平台`,
      description: `发现${countryInfo.name}的特色商品、促销活动和跨境购物攻略`,
    };
  } catch (error) {
    return {
      title: '国家购物指南 - AI价格比较平台',
      description: '探索全球跨境购物机会',
    };
  }
}

export default async function CountryPage({
  params,
  searchParams,
}: CountryPageProps) {
  try {
    const countryInfo = await getCountryInfo(params.code);

    return (
      <main className="container mx-auto py-6 min-h-[calc(100vh-4rem)]">
        <CountryHeader country={countryInfo} />

        <div className="mt-8">
          <Suspense fallback={<PageSkeleton type="grid" />}>
            <CountryProducts
              code={params.code}
              category={searchParams.category}
              sort={searchParams.sort}
              page={searchParams.page ? parseInt(searchParams.page) : 1}
            />
          </Suspense>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Suspense fallback={<PageSkeleton type="list" />}>
            <CountryPlatforms code={params.code} />
          </Suspense>

          <Suspense fallback={<PageSkeleton type="list" />}>
            <CountryDeals code={params.code} />
          </Suspense>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-6">
        <ErrorDisplay
          error={error instanceof Error ? error : new Error('加载页面失败')}
        />
      </div>
    );
  }
}