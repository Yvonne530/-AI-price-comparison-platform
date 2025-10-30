import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export async function errorMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
) {
  try {
    return await next();
  } catch (error) {
    console.error('API错误:', error);

    // Zod验证错误
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '验证失败',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Prisma错误
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': // 唯一约束冲突
          return NextResponse.json(
            {
              success: false,
              error: '记录已存在',
              details: error.meta,
            },
            { status: 409 }
          );
        case 'P2025': // 记录不存在
          return NextResponse.json(
            {
              success: false,
              error: '记录不存在',
              details: error.meta,
            },
            { status: 404 }
          );
        default:
          return NextResponse.json(
            {
              success: false,
              error: '数据库操作失败',
              details: process.env.NODE_ENV === 'development' ? error : undefined,
            },
            { status: 500 }
          );
      }
    }

    // JWT错误
    if (error.name === 'JWTError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        {
          success: false,
          error: '无效的认证令牌',
        },
        { status: 401 }
      );
    }

    // 自定义错误
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
        { status: 500 }
      );
    }

    // 未知错误
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}