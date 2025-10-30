import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiResponse } from '@/types/api';

interface Platform {
  id: string;
  name: string;
  logo: string;
  description: string;
  productCount: number;
  averageRating: number;
}

interface CountryPlatformsProps {
  code: string;
}

async function getCountryPlatforms(code: string) {
  const response = await fetch(`/api/countries/${code}/platforms`, {
    next: { revalidate: 3600 }, // 1小时缓存
  });

  if (!response.ok) {
    throw new Error('获取电商平台列表失败');
  }

  const data: ApiResponse<Platform[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || '加载平台信息失败');
  }

  return data.data;
}

export async function CountryPlatforms({ code }: CountryPlatformsProps) {
  try {
    const platforms = await getCountryPlatforms(code);

    if (platforms.length === 0) {
      return (
        <EmptyState
          title="暂无平台"
          description="该国家/地区暂时没有支持的电商平台"
        />
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>支持的电商平台</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={platform.logo}
                    alt={platform.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1">{platform.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {platform.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{platform.productCount} 件商品</span>
                    <span>★ {platform.averageRating.toFixed(1)} 分</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/search?platform=${platform.id}`}>
                    查看商品
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={error instanceof Error ? error : new Error('加载平台信息失败')}
      />
    );
  }
}