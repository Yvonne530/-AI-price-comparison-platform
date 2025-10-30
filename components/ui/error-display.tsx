'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ErrorDisplayProps {
  error: Error | null;
  resetError?: () => void;
}

export function ErrorDisplay({ error, resetError }: ErrorDisplayProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12">
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTitle>出错了</AlertTitle>
        <AlertDescription className="mt-2">
          {error?.message || '发生了未知错误，请稍后重试'}
        </AlertDescription>
        <div className="mt-4 flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            返回上一页
          </Button>
          {resetError && (
            <Button
              variant="default"
              onClick={resetError}
            >
              重试
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}