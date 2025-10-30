import { Metadata } from 'next';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: '注册 - AI价格比较平台',
  description: '创建您的账户，开始使用AI价格比较平台',
};

export default function RegisterPage() {
  return (
    <main className="container relative min-h-[calc(100vh-4rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/placeholder-logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          AI价格比较平台
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "加入我们的平台，发现全球最优惠的购物价格，让跨境购物变得更简单。"
            </p>
            <footer className="text-sm">平台团队</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader>
              <CardTitle>创建账户</CardTitle>
              <CardDescription>
                注册一个新账户以开始使用我们的服务
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}