import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiResponse } from '@/types/api';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  coverImage: string;
}

interface BlogListProps {
  category?: string;
  page: number;
}

async function getBlogPosts(category?: string, page: number = 1) {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(category && { category }),
  });

  const response = await fetch(`/api/content/blog?${params.toString()}`, {
    next: { revalidate: 3600 }, // 1小时缓存
  });

  if (!response.ok) {
    throw new Error('获取博客文章失败');
  }

  const data: ApiResponse<{
    posts: BlogPost[];
    total: number;
    totalPages: number;
  }> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || '加载文章失败');
  }

  return data.data;
}

export async function BlogList({ category, page }: BlogListProps) {
  try {
    const { posts, total, totalPages } = await getBlogPosts(category, page);

    if (posts.length === 0) {
      return (
        <EmptyState
          title="暂无文章"
          description="该分类下暂时没有文章"
          action={
            <Button variant="outline" asChild>
              <Link href="/blog">查看全部文章</Link>
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{post.readTime} 分钟阅读</span>
                </div>
                <CardTitle className="line-clamp-2">
                  <Link href={`/blog/${post.id}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {post.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden relative">
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {post.author.name}
                    </span>
                  </div>
                  <time className="text-sm text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
                  </time>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Button
                variant="outline"
                asChild
              >
                <Link
                  href={`/blog?${new URLSearchParams({
                    ...(category && { category }),
                    page: (page - 1).toString(),
                  })}`}
                >
                  上一页
                </Link>
              </Button>
            )}
            <span className="flex items-center px-4 text-muted-foreground">
              第 {page} 页，共 {totalPages} 页
            </span>
            {page < totalPages && (
              <Button
                variant="outline"
                asChild
              >
                <Link
                  href={`/blog?${new URLSearchParams({
                    ...(category && { category }),
                    page: (page + 1).toString(),
                  })}`}
                >
                  下一页
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={error instanceof Error ? error : new Error('加载文章失败')}
      />
    );
  }
}