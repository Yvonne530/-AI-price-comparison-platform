'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: '基础版',
    description: '适合个人用户的基础比价功能',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '基础价格比较',
      '最多3个收藏商品',
      '基础价格提醒',
      '标准客户支持',
    ],
    action: '免费开始',
    popular: false,
  },
  {
    id: 'pro',
    name: '专业版',
    description: '适合经常跨境购物的用户',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      '无限商品比较',
      '无限收藏商品',
      '高级价格提醒',
      '套利机会提醒',
      '优先客户支持',
      '历史价格分析',
    ],
    action: '升级专业版',
    popular: true,
  },
  {
    id: 'business',
    name: '企业版',
    description: '适合专业买手和小型企业',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      '所有专业版功能',
      'API访问权限',
      '批量比价功能',
      '团队协作功能',
      '专属客户经理',
      '自定义报表',
      '7×24小时支持',
    ],
    action: '联系销售',
    popular: false,
  },
];

export function PricingPlans() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={!isYearly ? 'font-medium' : 'text-muted-foreground'}>
          月付
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
          aria-label="切换年付"
        />
        <span className={isYearly ? 'font-medium' : 'text-muted-foreground'}>
          年付
          <span className="ml-1.5 inline-block text-sm text-primary">
            省20%
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={plan.popular ? 'border-primary shadow-lg' : ''}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                  最受欢迎
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-baseline gap-x-2">
                <span>{plan.name}</span>
                {plan.monthlyPrice > 0 && (
                  <span className="text-3xl font-bold">
                    ¥{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                )}
                {plan.monthlyPrice > 0 && (
                  <span className="text-muted-foreground">
                    /{isYearly ? '年' : '月'}
                  </span>
                )}
              </CardTitle>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.action}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}