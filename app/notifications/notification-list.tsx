'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiResponse } from '@/types/api';
import { Bell, Tag, Package, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'price_alert' | 'deal' | 'stock' | 'system';
  title: string;
  content: string;
  status: 'read' | 'unread';
  createdAt: string;
  link?: string;
}

interface NotificationListProps {
  type?: string;
  status?: string;
  page: number;
}

async function getNotifications(
  type?: string,
  status?: string,
  page: number = 1
) {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(type && { type }),
    ...(status && { status }),
  });

  const response = await fetch(`/api/notifications?${params.toString()}`);

  if (!response.ok) {
    throw new Error('获取通知列表失败');
  }

  const data: ApiResponse<{
    notifications: Notification[];
    total: number;
    totalPages: number;
  }> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || '加载通知失败');
  }

  return data.data;
}

async function markAsRead(notificationId: string) {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('标记通知已读失败');
  }

  return response.json();
}

const typeIcons = {
  price_alert: <Bell className="h-5 w-5" />,
  deal: <Tag className="h-5 w-5" />,
  stock: <Package className="h-5 w-5" />,
  system: <Info className="h-5 w-5" />,
};

export function NotificationList({ type, status, page }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useState(() => {
    getNotifications(type, status, page)
      .then(({ notifications, total, totalPages }) => {
        setNotifications(notifications);
        setTotal(total);
        setTotalPages(totalPages);
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  });

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (loading) {
    return null; // 父组件会显示 PageSkeleton
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="暂无通知"
        description="您目前没有任何通知消息"
      />
    );
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, status: 'read' as const }
            : notification
        )
      );
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 ${
            notification.status === 'unread' ? 'bg-muted/50' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-full ${
                notification.status === 'unread'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {typeIcons[notification.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h3 className="font-medium line-clamp-1">
                  {notification.title}
                </h3>
                <time className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(notification.createdAt).toLocaleDateString('zh-CN')}
                </time>
              </div>
              <p className="text-muted-foreground mb-3">
                {notification.content}
              </p>
              <div className="flex items-center gap-3">
                {notification.link && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={notification.link}>查看详情</Link>
                  </Button>
                )}
                {notification.status === 'unread' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    标记已读
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Button
              variant="outline"
              asChild
            >
              <Link
                href={`/notifications?${new URLSearchParams({
                  ...(type && { type }),
                  ...(status && { status }),
                  page: (page - 1).toString(),
                })}`}
              >
                上一页
              </Link>
            </Button>
          )}
          <span className="flex items-center px-4 text-muted-foreground">
            第 {page} 页，共 {totalPages} 页
          </span>
          {page < totalPages && (
            <Button
              variant="outline"
              asChild
            >
              <Link
                href={`/notifications?${new URLSearchParams({
                  ...(type && { type }),
                  ...(status && { status }),
                  page: (page + 1).toString(),
                })}`}
              >
                下一页
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}