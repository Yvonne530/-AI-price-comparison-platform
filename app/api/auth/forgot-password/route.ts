import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth/jwt';
import { sendEmail } from '@/lib/services/email';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// 忘记密码请求
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 即使用户不存在也返回成功，避免泄露用户信息
    if (!user) {
      return successResponse({
        message: '如果该邮箱存在，我们已发送重置密码链接',
      });
    }

    // 生成重置令牌
    const resetToken = generateToken({ userId: user.id, type: 'reset' }, '1h');
    
    // 保存重置令牌
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1小时后过期
      },
    });

    // 发送重置邮件
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: '重置您的密码',
      html: `
        <h1>重置密码请求</h1>
        <p>您好，我们收到了重置密码的请求。</p>
        <p>请点击下面的链接重置您的密码：</p>
        <a href="${resetUrl}" target="_blank">重置密码</a>
        <p>此链接将在1小时后失效。</p>
        <p>如果您没有请求重置密码，请忽略此邮件。</p>
      `,
    });

    return successResponse({
      message: '如果该邮箱存在，我们已发送重置密码链接',
    });
  } catch (error) {
    return handleApiError(error);
  }
}