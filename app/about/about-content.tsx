import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/error-display';
import { ApiResponse } from '@/types/api';

interface AboutData {
  title: string;
  description: string;
  features: {
    title: string;
    description: string;
  }[];
  team: {
    name: string;
    role: string;
    bio: string;
  }[];
}

async function getAboutContent() {
  const response = await fetch('/api/content/about', {
    next: { revalidate: 3600 }, // 1小时缓存
  });

  if (!response.ok) {
    throw new Error('获取平台介绍内容失败');
  }

  const data: ApiResponse<AboutData> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || '加载内容失败');
  }

  return data.data;
}

export async function AboutContent() {
  try {
    const content = await getAboutContent();

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{content.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {content.description}
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {content.features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>我们的团队</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {content.team.map((member, index) => (
                <div
                  key={index}
                  className="text-center space-y-2 p-4 rounded-lg border"
                >
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.bio}
                  </p>
                </div>
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