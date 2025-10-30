import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证token并获取会话ID
    const payload = await verifyJWT(token);

    // 删除会话
    await prisma.session.delete({
      where: { id: payload.sessionId },
    });

    return NextResponse.json({ message: '已成功登出' });
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    );
  }
}