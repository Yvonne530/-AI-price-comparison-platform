import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Minus } from 'lucide-react';

const features = [
  {
    category: '核心功能',
    items: [
      {
        name: '价格比较',
        basic: '基础比较',
        pro: '无限比较',
        business: '无限比较',
      },
      {
        name: '收藏商品',
        basic: '最多3个',
        pro: '无限',
        business: '无限',
      },
      {
        name: '价格提醒',
        basic: '基础提醒',
        pro: '高级提醒',
        business: '自定义提醒',
      },
    ],
  },
  {
    category: '高级功能',
    items: [
      {
        name: '套利机会',
        basic: false,
        pro: true,
        business: true,
      },
      {
        name: '历史价格分析',
        basic: false,
        pro: true,
        business: true,
      },
      {
        name: '批量比价',
        basic: false,
        pro: false,
        business: true,
      },
    ],
  },
  {
    category: '专业工具',
    items: [
      {
        name: 'API访问',
        basic: false,
        pro: false,
        business: true,
      },
      {
        name: '自定义报表',
        basic: false,
        pro: false,
        business: true,
      },
      {
        name: '团队协作',
        basic: false,
        pro: false,
        business: true,
      },
    ],
  },
  {
    category: '支持服务',
    items: [
      {
        name: '客户支持',
        basic: '标准支持',
        pro: '优先支持',
        business: '24/7专属支持',
      },
      {
        name: '培训服务',
        basic: false,
        pro: '基础培训',
        business: '定制培训',
      },
    ],
  },
];

export function PricingFeatures() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-12">功能对比</h2>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">功能</TableHead>
              <TableHead>基础版</TableHead>
              <TableHead>专业版</TableHead>
              <TableHead>企业版</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature) => (
              <>
                <TableRow key={feature.category}>
                  <TableCell colSpan={4} className="bg-muted/50 font-medium">
                    {feature.category}
                  </TableCell>
                </TableRow>
                {feature.items.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {typeof item.basic === 'boolean' ? (
                        item.basic ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        item.basic
                      )}
                    </TableCell>
                    <TableCell>
                      {typeof item.pro === 'boolean' ? (
                        item.pro ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        item.pro
                      )}
                    </TableCell>
                    <TableCell>
                      {typeof item.business === 'boolean' ? (
                        item.business ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        item.business
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}