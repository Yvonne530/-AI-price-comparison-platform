import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/error-display';
import { ApiResponse } from '@/types/api';

interface HelpData {
  categories: {
    title: string;
    faqs: {
      question: string;
      answer: string;
    }[];
  }[];
  guides: {
    title: string;
    content: string;
  }[];
}

async function getHelpContent() {
  const response = await fetch('/api/content/help', {
    next: { revalidate: 3600 }, // 1小时缓存
  });

  if (!response.ok) {
    throw new Error('获取帮助内容失败');
  }

  const data: ApiResponse<HelpData> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || '加载内容失败');
  }

  return data.data;
}

export async function HelpContent() {
  try {
    const content = await getHelpContent();

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent>
            {content.categories.map((category, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-medium mb-4">{category.title}</h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`faq-${index}-${faqIndex}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用指南</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {content.guides.map((guide, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {guide.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={error instanceof Error ? error : new Error('加载内容失败')}
      />
    );
  }
}