import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function authMiddleware(request: NextRequest) {
  try {
    // 检查是否是API请求
    if (!request.url.includes('/api/')) {
      return NextResponse.next();
    }

    // 排除不需要认证的路由
    const publicPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
    ];
    if (publicPaths.some(path => request.url.includes(path))) {
      return NextResponse.next();
    }

    // 获取token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: '未授权访问' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 验证token
    const payload = await verifyJWT(token);

    // 检查会话是否有效
    const session = await prisma.session.findUnique({
      where: {
        id: payload.sessionId,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: '会话已过期' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 更新会话活动时间
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivity: new Date() },
    });

    // 将用户信息添加到请求中
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Id', session.user.id);
    requestHeaders.set('X-User-Role', session.user.role);

    // 继续处理请求
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: '认证失败' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 配置中间件匹配的路由
export const config = {
  matcher: '/api/:path*',
};