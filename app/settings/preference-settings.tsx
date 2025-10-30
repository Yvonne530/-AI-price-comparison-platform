'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/api';

const preferenceSchema = z.object({
  defaultCurrency: z.string(),
  defaultCountry: z.string(),
  darkMode: z.boolean(),
  autoRefresh: z.boolean(),
  priceFormat: z.string(),
});

type PreferenceFormValues = z.infer<typeof preferenceSchema>;

export function PreferenceSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PreferenceFormValues>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      defaultCurrency: 'USD',
      defaultCountry: 'US',
      darkMode: false,
      autoRefresh: true,
      priceFormat: 'decimal',
    },
  });

  async function onSubmit(values: PreferenceFormValues) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result: ApiResponse<{ message: string }> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '保存设置失败');
      }

      if (result.success) {
        toast({
          title: '设置已更新',
          description: '您的偏好设置已成功保存',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: error instanceof Error ? error.message : '请稍后重试',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>偏好设置</CardTitle>
        <CardDescription>
          自定义您的使用体验和显示偏好
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>默认货币</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择默认货币" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">美元 (USD)</SelectItem>
                      <SelectItem value="EUR">欧元 (EUR)</SelectItem>
                      <SelectItem value="GBP">英镑 (GBP)</SelectItem>
                      <SelectItem value="JPY">日元 (JPY)</SelectItem>
                      <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    设置显示价格的默认货币单位
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>默认国家/地区</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择默认地区" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="US">美国</SelectItem>
                      <SelectItem value="UK">英国</SelectItem>
                      <SelectItem value="DE">德国</SelectItem>
                      <SelectItem value="JP">日本</SelectItem>
                      <SelectItem value="CN">中国</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    设置默认显示的商品地区
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>价格格式</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择价格格式" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="decimal">小数点 (1,234.56)</SelectItem>
                      <SelectItem value="comma">逗号 (1.234,56)</SelectItem>
                      <SelectItem value="space">空格 (1 234.56)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    设置价格的显示格式
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="darkMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      深色模式
                    </FormLabel>
                    <FormDescription>
                      启用深色主题以减少眼睛疲劳
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoRefresh"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      自动刷新
                    </FormLabel>
                    <FormDescription>
                      自动更新价格和库存信息
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存设置'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}