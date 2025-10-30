import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: '忘记密码 - AI价格比较平台',
  description: '重置您的账户密码',
};

export default function ForgotPasswordPage() {
  return (
    <main className="container mx-auto min-h-[calc(100vh-4rem)] flex items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>忘记密码</CardTitle>
          <CardDescription>
            输入您的邮箱地址，我们将向您发送密码重置链接
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}