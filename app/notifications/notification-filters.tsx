'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const types = [
  { id: 'price_alert', name: '价格提醒', count: 0 },
  { id: 'deal', name: '特价通知', count: 0 },
  { id: 'stock', name: '库存提醒', count: 0 },
  { id: 'system', name: '系统消息', count: 0 },
];

const statuses = [
  { id: 'unread', name: '未读' },
  { id: 'read', name: '已读' },
];

export function NotificationFilters() {
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');
  const currentStatus = searchParams.get('status');

  return (
    <Card>
      <CardHeader>
        <CardTitle>筛选条件</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium mb-2 px-3">通知类型</h3>
            <Link
              href="/notifications"
              className={cn(
                'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                !currentType && 'bg-muted'
              )}
            >
              <span>全部通知</span>
            </Link>
            {types.map((type) => (
              <Link
                key={type.id}
                href={`/notifications?type=${type.id}${
                  currentStatus ? `&status=${currentStatus}` : ''
                }`}
                className={cn(
                  'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                  currentType === type.id && 'bg-muted'
                )}
              >
                <span>{type.name}</span>
                {type.count > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {type.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium mb-2 px-3">阅读状态</h3>
            {statuses.map((status) => (
              <Link
                key={status.id}
                href={`/notifications?${new URLSearchParams({
                  ...(currentType && { type: currentType }),
                  status: status.id,
                })}`}
                className={cn(
                  'flex justify-between items-center px-3 py-2 rounded-md hover:bg-muted transition-colors',
                  currentStatus === status.id && 'bg-muted'
                )}
              >
                <span>{status.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}