import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: '重置密码 - AI价格比较平台',
  description: '设置您的新密码',
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  if (!searchParams.token) {
    return (
      <main className="container mx-auto min-h-[calc(100vh-4rem)] flex items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">无效的重置链接</CardTitle>
            <CardDescription>
              此密码重置链接无效或已过期。请重新申请密码重置。
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto min-h-[calc(100vh-4rem)] flex items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>重置密码</CardTitle>
          <CardDescription>
            请设置您的新密码
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={searchParams.token} />
        </CardContent>
      </Card>
    </main>
  );
}