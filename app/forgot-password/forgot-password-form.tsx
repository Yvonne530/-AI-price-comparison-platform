'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
});

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result: ApiResponse<{ message: string }> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '发送重置邮件失败');
      }

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: '邮件已发送',
          description: '请检查您的邮箱以重置密码',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '发送失败',
        description: error instanceof Error ? error.message : '请稍后重试',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">重置邮件已发送</h3>
        <p className="text-sm text-muted-foreground">
          我们已向您的邮箱发送了密码重置链接，请查收并按照邮件中的说明进行操作。
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsSubmitted(false)}
        >
          重新发送
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱地址</FormLabel>
              <FormControl>
                <Input
                  placeholder="your@email.com"
                  type="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? '发送中...' : '发送重置链接'}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          记起密码了？{' '}
          <Link href="/login" className="text-primary hover:underline">
            返回登录
          </Link>
        </div>
      </form>
    </Form>
  );
}