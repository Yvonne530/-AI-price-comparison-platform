import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { signJWT } from '@/lib/auth/jwt';

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().min(2, '名称至少2个字符'),
  device: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, device } = registerSchema.parse(body);

    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // 创建会话
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        device: device || '未知设备',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '未知IP',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7天后过期
      },
    });

    // 生成JWT
    const token = await signJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    // 创建欢迎通知
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM',
        title: '欢迎加入',
        message: '感谢您注册我们的价格比较平台！开始探索最优惠的商品吧。',
      },
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '验证失败', details: error.errors },
        { status: 400 }
      );
    }

    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    );
  }
}