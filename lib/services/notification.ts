import { prisma } from '@/lib/prisma';
import { sendEmail } from './email';
import { NotificationType } from '@prisma/client';

// 通知服务类
export class NotificationService {
  private static instance: NotificationService;
  private constructor() {}

  // 单例模式
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 创建通知
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          content,
          metadata,
        },
      });

      // 获取用户邮箱
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, notificationSettings: true },
      });

      // 如果用户启用了邮件通知，发送邮件
      if (user?.notificationSettings?.emailEnabled) {
        await this.sendEmailNotification(user.email, type, title, content, metadata);
      }

      return notification;
    } catch (error) {
      console.error('创建通知失败:', error);
      throw error;
    }
  }

  // 发送邮件通知
  private async sendEmailNotification(
    email: string,
    type: NotificationType,
    title: string,
    content: string,
    metadata: Record<string, any>
  ) {
    try {
      switch (type) {
        case 'PRICE_ALERT':
          await sendEmail(email, 'price-alert', {
            productName: metadata.productName,
            currentPrice: metadata.currentPrice,
            targetPrice: metadata.targetPrice,
            currency: metadata.currency,
            platform: metadata.platform,
            productUrl: metadata.productUrl,
          });
          break;
        // 可以添加其他类型的通知处理
        default:
          // 默认通知模板
          await sendEmail(email, 'welcome', {
            name: email.split('@')[0],
            title,
            content,
          });
      }
    } catch (error) {
      console.error('发送邮件通知失败:', error);
      // 不抛出错误，避免影响主流程
    }
  }

  // 获取用户的通知列表
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
    type?: NotificationType
  ) {
    try {
      const where = {
        userId,
        ...(type && { type }),
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('获取用户通知失败:', error);
      throw error;
    }
  }

  // 标记通知为已读
  async markAsRead(notificationId: string, userId: string) {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('标记通知已读失败:', error);
      throw error;
    }
  }

  // 批量标记通知为已读
  async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('批量标记通知已读失败:', error);
      throw error;
    }
  }

  // 删除通知
  async deleteNotification(notificationId: string, userId: string) {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId,
        },
      });
    } catch (error) {
      console.error('删除通知失败:', error);
      throw error;
    }
  }

  // 清空用户的所有通知
  async clearAllNotifications(userId: string) {
    try {
      await prisma.notification.deleteMany({
        where: { userId },
      });
    } catch (error) {
      console.error('清空通知失败:', error);
      throw error;
    }
  }

  // 获取未读通知数量
  async getUnreadCount(userId: string) {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      throw error;
    }
  }
}

// 导出通知服务实例
export const notificationService = NotificationService.getInstance();