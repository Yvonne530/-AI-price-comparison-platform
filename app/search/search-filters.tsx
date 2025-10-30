'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SearchFiltersProps {
  initialFilters: {
    minPrice?: string;
    maxPrice?: string;
    platform?: string;
    country?: string;
    sort?: string;
  };
}

export function SearchFilters({ initialFilters }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const current = new URLSearchParams(searchParams.toString());
    
    // 更新或删除参数
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    // 保持搜索关键词
    const query = current.get('q');
    if (query) {
      current.set('q', query);
    }

    router.push(`/search?${current.toString()}`);
  };

  const resetFilters = () => {
    const current = new URLSearchParams(searchParams.toString());
    const query = current.get('q');
    router.push(`/search${query ? `?q=${query}` : ''}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>筛选条件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>价格区间</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="最低"
              defaultValue={initialFilters.minPrice}
              onChange={(e) => updateFilters({ minPrice: e.target.value })}
              className="w-full"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="最高"
              defaultValue={initialFilters.maxPrice}
              onChange={(e) => updateFilters({ maxPrice: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>电商平台</Label>
          <Select
            defaultValue={initialFilters.platform}
            onValueChange={(value) => updateFilters({ platform: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择平台" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amazon">亚马逊</SelectItem>
              <SelectItem value="ebay">eBay</SelectItem>
              <SelectItem value="aliexpress">速卖通</SelectItem>
              <SelectItem value="walmart">沃尔玛</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>国家/地区</Label>
          <Select
            defaultValue={initialFilters.country}
            onValueChange={(value) => updateFilters({ country: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择国家" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">美国</SelectItem>
              <SelectItem value="uk">英国</SelectItem>
              <SelectItem value="de">德国</SelectItem>
              <SelectItem value="jp">日本</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>排序方式</Label>
          <Select
            defaultValue={initialFilters.sort}
            onValueChange={(value) => updateFilters({ sort: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">价格从低到高</SelectItem>
              <SelectItem value="price_desc">价格从高到低</SelectItem>
              <SelectItem value="rating">评分最高</SelectItem>
              <SelectItem value="updated">最近更新</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={resetFilters}
        >
          重置筛选
        </Button>
      </CardContent>
    </Card>
  );
}