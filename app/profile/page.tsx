import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApiResponse, UserProfile } from '@/types/api';

// 加载状态组件
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    </div>
  );
}

async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
  // 检查环境变量是否存在
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    // Return mock data if API URL is not defined
    return {
      success: true,
      data: {
        id: '1',
        email: 'user@example.com',
        name: '测试用户',
        avatar: '/placeholder-user.jpg',
        role: 'USER',
        createdAt: new Date().toISOString(),
        subscription: {
          plan: 'FREE',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          features: [
            '基础商品搜索',
            '3个商品比较',
            '有限的套利机会'
          ]
        },
        statistics: {
          totalSearches: 25,
          savedProducts: 8,
          alertsCreated: 3
        },
        searchHistory: [
          { id: '1', query: 'iPhone 15', createdAt: new Date().toISOString() },
          { id: '2', query: 'MacBook Air', createdAt: new Date().toISOString() },
          { id: '3', query: 'AirPods Pro', createdAt: new Date().toISOString() }
        ]
      }
    };
  }

  const res = await fetch(`${apiUrl}/api/user/profile`, {
    next: { revalidate: 60 }, // 1分钟缓存
    headers: {
      // 这里应该从服务端获取token，这是示例
      Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
    },
  });

  if (res.status === 401) {
    redirect('/login');
  }

  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return res.json();
}

export default async function ProfilePage() {
  const { data: profile } = await getUserProfile();

  return (
    <main className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<ProfileSkeleton />}>
        {/* 用户基本信息 */}
        <div className="flex items-center gap-4">
          <Image
            src={profile.avatar || '/placeholder-user.jpg'}
            alt={profile.name || '用户头像'}
            width={80}
            height={80}
            className="rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.name || '未设置昵称'}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        {/* 订阅状态 */}
        <Card>
          <CardHeader>
            <CardTitle>订阅信息</CardTitle>
            <CardDescription>当前订阅计划和有效期</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge
                  variant={
                    profile.subscription.plan === 'FREE'
                      ? 'secondary'
                      : profile.subscription.plan === 'PRO'
                      ? 'default'
                      : 'success'
                  }
                >
                  {profile.subscription.plan}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  有效期至：
                  {new Date(profile.subscription.validUntil).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline">升级订阅</Button>
            </div>
            <div className="mt-4 grid gap-2">
              {profile.subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 使用统计 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>总搜索次数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile.statistics.totalSearches}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>已收藏商品</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile.statistics.savedProducts}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>价格提醒</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {profile.statistics.alertsCreated}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索历史 */}
        <Card>
          <CardHeader>
            <CardTitle>最近搜索</CardTitle>
            <CardDescription>展示最近的搜索记录</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>搜索关键词</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.searchHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>{history.query}</TableCell>
                    <TableCell>
                      {new Date(history.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        重新搜索
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Suspense>
    </main>
  );
}