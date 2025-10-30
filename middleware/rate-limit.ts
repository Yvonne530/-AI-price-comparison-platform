import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { config } from '@/config/config';

const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
});

interface RateLimitOptions {
  limit: number;        // 时间窗口内允许的最大请求数
  window: number;       // 时间窗口大小（秒）
  errorMessage?: string; // 自定义错误消息
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    next: () => Promise<NextResponse>
  ) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userId = request.headers.get('X-User-Id');
    const key = `rate-limit:${userId || ip}`;

    try {
      // 获取当前请求计数
      const [requestCount] = await redis
        .pipeline()
        .incr(key)
        .expire(key, options.window)
        .exec();

      // 设置响应头
      const headers = new Headers({
        'X-RateLimit-Limit': options.limit.toString(),
        'X-RateLimit-Remaining': Math.max(0, options.limit - requestCount).toString(),
        'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + options.window).toString(),
      });

      // 检查是否超过限制
      if (requestCount > options.limit) {
        return NextResponse.json(
          {
            success: false,
            error: options.errorMessage || '请求过于频繁，请稍后再试',
          },
          {
            status: 429,
            headers,
          }
        );
      }

      // 继续处理请求
      const response = await next();
      
      // 将速率限制信息添加到响应头
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('速率限制中间件错误:', error);
      // 如果Redis出错，继续处理请求但不进行限制
      return next();
    }
  };
}

// 预定义的速率限制配置
export const rateLimits = {
  // 普通API请求限制
  default: {
    limit: 100,
    window: 60, // 1分钟
  },

  // 登录/注册请求限制
  auth: {
    limit: 5,
    window: 300, // 5分钟
    errorMessage: '登录尝试次数过多，请5分钟后再试',
  },

  // 搜索请求限制
  search: {
    limit: 30,
    window: 60, // 1分钟
    errorMessage: '搜索请求过于频繁，请稍后再试',
  },

  // 爬虫API限制
  crawler: {
    limit: 10,
    window: 60, // 1分钟
    errorMessage: '爬虫请求过于频繁，请稍后再试',
  },
};