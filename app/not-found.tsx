import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold">页面未找到</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">返回首页</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/search">搜索商品</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}