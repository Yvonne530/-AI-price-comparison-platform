import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';

// 获取用户的所有会话
export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);

    const sessions = await prisma.session.findMany({
      where: { userId: payload.sub },
      orderBy: { lastActivity: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    return NextResponse.json(
      { error: '获取会话列表失败' },
      { status: 500 }
    );
  }
}

// 删除指定会话
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少会话ID' },
        { status: 400 }
      );
    }

    // 确保用户只能删除自己的会话
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== payload.sub) {
      return NextResponse.json(
        { error: '无权操作此会话' },
        { status: 403 }
      );
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ message: '会话已删除' });
  } catch (error) {
    console.error('删除会话失败:', error);
    return NextResponse.json(
      { error: '删除会话失败' },
      { status: 500 }
    );
  }
}

// 删除所有会话（除了当前会话）
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);

    await prisma.session.deleteMany({
      where: {
        userId: payload.sub,
        id: { not: payload.sessionId },
      },
    });

    return NextResponse.json({ message: '所有其他会话已删除' });
  } catch (error) {
    console.error('删除所有会话失败:', error);
    return NextResponse.json(
      { error: '删除所有会话失败' },
      { status: 500 }
    );
  }
}