import nodemailer from 'nodemailer';
import { config } from '@/config/config';

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

// 邮件模板类型
type EmailTemplate = 'welcome' | 'reset-password' | 'price-alert' | 'verification';

// 邮件模板配置
const templates: Record<EmailTemplate, {
  subject: string;
  template: (data: any) => string;
}> = {
  welcome: {
    subject: '欢迎加入价格比较平台',
    template: (data: { name: string }) => `
      <h1>欢迎 ${data.name}！</h1>
      <p>感谢您注册我们的价格比较平台。我们将为您提供最优惠的商品价格信息。</p>
      <p>如果您有任何问题，请随时联系我们的客服团队。</p>
    `,
  },
  'reset-password': {
    subject: '重置密码',
    template: (data: { resetLink: string }) => `
      <h1>重置密码请求</h1>
      <p>您收到此邮件是因为您（或其他人）请求重置密码。</p>
      <p>请点击以下链接重置密码：</p>
      <a href="${data.resetLink}">${data.resetLink}</a>
      <p>如果您没有请求重置密码，请忽略此邮件。</p>
    `,
  },
  'price-alert': {
    subject: '价格提醒',
    template: (data: {
      productName: string;
      currentPrice: number;
      targetPrice: number;
      currency: string;
      platform: string;
      productUrl: string;
    }) => `
      <h1>价格提醒</h1>
      <p>您关注的商品 "${data.productName}" 当前价格已达到您设置的目标价格！</p>
      <ul>
        <li>当前价格: ${data.currency} ${data.currentPrice}</li>
        <li>目标价格: ${data.currency} ${data.targetPrice}</li>
        <li>销售平台: ${data.platform}</li>
      </ul>
      <p>立即查看：<a href="${data.productUrl}">${data.productUrl}</a></p>
    `,
  },
  verification: {
    subject: '验证您的邮箱',
    template: (data: { verificationLink: string }) => `
      <h1>验证您的邮箱</h1>
      <p>请点击以下链接验证您的邮箱地址：</p>
      <a href="${data.verificationLink}">${data.verificationLink}</a>
      <p>如果您没有注册账号，请忽略此邮件。</p>
    `,
  },
};

// 发送邮件函数
export async function sendEmail(
  to: string,
  templateName: EmailTemplate,
  data: any
) {
  try {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`邮件模板 ${templateName} 不存在`);
    }

    const mailOptions = {
      from: `"价格比较平台" <${config.email.user}>`,
      to,
      subject: template.subject,
      html: template.template(data),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功:', info.messageId);
    return info;
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw error;
  }
}

// 发送批量邮件函数
export async function sendBulkEmails(
  recipients: Array<{ email: string; data: any }>,
  templateName: EmailTemplate
) {
  try {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`邮件模板 ${templateName} 不存在`);
    }

    const results = await Promise.allSettled(
      recipients.map(({ email, data }) =>
        sendEmail(email, templateName, data)
      )
    );

    // 统计发送结果
    const summary = results.reduce(
      (acc, result) => {
        if (result.status === 'fulfilled') {
          acc.success++;
        } else {
          acc.failed++;
          acc.errors.push(result.reason);
        }
        return acc;
      },
      { success: 0, failed: 0, errors: [] as any[] }
    );

    return summary;
  } catch (error) {
    console.error('批量邮件发送失败:', error);
    throw error;
  }
}