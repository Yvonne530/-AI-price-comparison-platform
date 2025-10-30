'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <h1 className="text-6xl font-bold text-destructive mb-4">500</h1>
          <h2 className="text-2xl font-semibold">服务器错误</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            抱歉，服务器出现了一些问题。我们正在努力修复中。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => reset()}>重试</Button>
            <Button variant="outline" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-left">
              <p className="text-sm font-mono break-all">
                {error.message || error.toString()}
              </p>
              {error.digest && (
                <p className="text-sm font-mono text-muted-foreground mt-2">
                  错误ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}