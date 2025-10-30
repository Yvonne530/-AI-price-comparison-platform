import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiResponse, ArbitrageOpportunity } from '@/types/api';

// 加载状态组件
function ArbitrageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function getArbitrageOpportunities(
  page = 1,
  filters?: { minProfitRate?: number; country?: string }
): Promise<ApiResponse<{
  opportunities: ArbitrageOpportunity[];
  total: number;
}>> {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    ...(filters?.minProfitRate && { minProfitRate: filters.minProfitRate.toString() }),
    ...(filters?.country && { country: filters.country }),
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/arbitrage/opportunities?${searchParams}`,
    { next: { revalidate: 300 } } // 5分钟缓存
  );

  if (!res.ok) {
    throw new Error('Failed to fetch arbitrage opportunities');
  }

  return res.json();
}

export default async function ArbitragePage({
  searchParams,
}: {
  searchParams: { page?: string; minProfitRate?: string; country?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const filters = {
    minProfitRate: searchParams.minProfitRate ? Number(searchParams.minProfitRate) : undefined,
    country: searchParams.country,
  };

  const { data } = await getArbitrageOpportunities(page, filters);
  const { opportunities, total } = data;

  return (
    <main className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">跨境套利机会</h1>

      <Suspense fallback={<ArbitrageSkeleton />}>
        <div className="flex gap-4 mb-6">
          <Select defaultValue={filters.country}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="选择国家/地区" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">美国</SelectItem>
              <SelectItem value="JP">日本</SelectItem>
              <SelectItem value="UK">英国</SelectItem>
              <SelectItem value="DE">德国</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue={filters.minProfitRate?.toString()}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="最低利润率" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10% 以上</SelectItem>
              <SelectItem value="20">20% 以上</SelectItem>
              <SelectItem value="30">30% 以上</SelectItem>
              <SelectItem value="50">50% 以上</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>套利机会列表</CardTitle>
          </CardHeader>
          <CardContent>
            {opportunities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>产品</TableHead>
                    <TableHead>来源国家/平台</TableHead>
                    <TableHead>目标国家/平台</TableHead>
                    <TableHead>利润率</TableHead>
                    <TableHead>预期利润</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((opportunity) => (
                    <TableRow key={opportunity.id}>
                      <TableCell className="font-medium">
                        {opportunity.productName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline">
                            {opportunity.sourceCountry}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {opportunity.sourcePlatform}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline">
                            {opportunity.targetCountry}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {opportunity.targetPlatform}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            opportunity.profitRate >= 30
                              ? 'success'
                              : opportunity.profitRate >= 20
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {opportunity.profitRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {opportunity.absoluteProfit.toFixed(2)}{' '}
                        {opportunity.targetPrice.currency}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(opportunity.sourcePrice.url, '_blank')
                          }
                        >
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无符合条件的套利机会
              </div>
            )}
          </CardContent>
        </Card>
      </Suspense>
    </main>
  );
}