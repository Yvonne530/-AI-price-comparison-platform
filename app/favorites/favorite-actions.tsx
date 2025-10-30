'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ApiResponse } from '@/types/api';

interface FavoriteActionsProps {
  productId: string;
}

export function FavoriteActions({ productId }: FavoriteActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const removeFavorite = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/favorites/${productId}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<{ message: string }> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '移除收藏失败');
      }

      if (result.success) {
        toast({
          title: '已移除收藏',
          description: '商品已从收藏列表中移除',
        });
        router.refresh();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: error instanceof Error ? error.message : '请稍后重试',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => router.push(`/products/${productId}`)}
      >
        查看详情
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isLoading}>
            {isLoading ? '移除中...' : '移除收藏'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除收藏？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将从您的收藏列表中移除该商品。此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={removeFavorite}>
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}