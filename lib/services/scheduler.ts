import { CronJob } from 'cron';
import { logger } from './logger';
import { prisma } from '@/lib/prisma';
import { notificationService } from './notification';
import { cacheService } from './cache';

// 定时任务管理器类
export class Scheduler {
  private static instance: Scheduler;
  private jobs: Map<string, CronJob>;

  private constructor() {
    this.jobs = new Map();
  }

  // 单例模式
  public static getInstance(): Scheduler {
    if (!Scheduler.instance) {
      Scheduler.instance = new Scheduler();
    }
    return Scheduler.instance;
  }

  // 初始化所有定时任务
  async initialize() {
    try {
      logger.info('正在初始化定时任务...');

      // 清理过期会话
      this.registerJob('cleanExpiredSessions', '0 0 * * *', async () => {
        try {
          const result = await prisma.session.deleteMany({
            where: {
              expiresAt: {
                lt: new Date(),
              },
            },
          });
          logger.info(`已清理 ${result.count} 个过期会话`);
        } catch (error) {
          logger.error('清理过期会话失败', error);
        }
      });

      // 清理过期通知
      this.registerJob('cleanExpiredNotifications', '0 0 * * *', async () => {
        try {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const result = await prisma.notification.deleteMany({
            where: {
              createdAt: {
                lt: thirtyDaysAgo,
              },
              read: true,
            },
          });
          logger.info(`已清理 ${result.count} 个过期通知`);
        } catch (error) {
          logger.error('清理过期通知失败', error);
        }
      });

      // 检查价格提醒
      this.registerJob('checkPriceAlerts', '*/30 * * * *', async () => {
        try {
          // 获取所有活动的价格提醒
          const alerts = await prisma.priceAlert.findMany({
            where: {
              status: 'ACTIVE',
            },
            include: {
              user: true,
              product: {
                include: {
                  prices: {
                    orderBy: {
                      price: 'asc',
                    },
                    take: 1,
                  },
                },
              },
            },
          });

          for (const alert of alerts) {
            const currentPrice = alert.product.prices[0]?.price;
            if (currentPrice && currentPrice <= alert.targetPrice) {
              // 创建通知
              await notificationService.createNotification(
                alert.userId,
                'PRICE_ALERT',
                '价格提醒',
                `您关注的商品 "${alert.product.name}" 当前价格已达到您设置的目标价格！`,
                {
                  productName: alert.product.name,
                  currentPrice,
                  targetPrice: alert.targetPrice,
                  currency: alert.product.prices[0].currency,
                  platform: alert.product.prices[0].platform,
                  productUrl: alert.product.prices[0].url,
                }
              );

              // 更新提醒状态
              await prisma.priceAlert.update({
                where: { id: alert.id },
                data: { status: 'TRIGGERED' },
              });
            }
          }
        } catch (error) {
          logger.error('检查价格提醒失败', error);
        }
      });

      // 清理缓存
      this.registerJob('cleanCache', '0 */6 * * *', async () => {
        try {
          // 清理过期的产品缓存
          await cacheService.deleteByTag('products');
          logger.info('已清理产品缓存');
        } catch (error) {
          logger.error('清理缓存失败', error);
        }
      });

      // 更新搜索热度
      this.registerJob('updateSearchTrends', '0 */4 * * *', async () => {
        try {
          const now = new Date();
          const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

          // 获取24小时内的搜索记录
          const searchTrends = await prisma.search.groupBy({
            by: ['query'],
            where: {
              createdAt: {
                gte: twentyFourHoursAgo,
              },
            },
            _count: true,
            orderBy: {
              _count: {
                query: 'desc',
              },
            },
            take: 10,
          });

          // 缓存热门搜索
          await cacheService.set(
            'search:trending',
            searchTrends.map(trend => ({
              query: trend.query,
              count: trend._count,
            })),
            6 * 60 * 60 // 6小时缓存
          );

          logger.info('已更新搜索热度');
        } catch (error) {
          logger.error('更新搜索热度失败', error);
        }
      });

      logger.info('定时任务初始化完成');
    } catch (error) {
      logger.error('定时任务初始化失败', error);
      throw error;
    }
  }

  // 注册定时任务
  private registerJob(name: string, cronTime: string, onTick: () => Promise<void>) {
    try {
      // 停止已存在的任务
      if (this.jobs.has(name)) {
        this.jobs.get(name)?.stop();
      }

      // 创建新任务
      const job = new CronJob(
        cronTime,
        async () => {
          logger.info(`开始执行定时任务: ${name}`);
          try {
            await onTick();
            logger.info(`定时任务执行完成: ${name}`);
          } catch (error) {
            logger.error(`定时任务执行失败: ${name}`, error);
          }
        },
        null,
        true,
        'Asia/Shanghai'
      );

      // 保存任务
      this.jobs.set(name, job);
      logger.info(`已注册定时任务: ${name}`);
    } catch (error) {
      logger.error(`注册定时任务失败: ${name}`, error);
      throw error;
    }
  }

  // 停止所有任务
  stopAll() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`已停止定时任务: ${name}`);
    });
    this.jobs.clear();
  }

  // 重启所有任务
  restartAll() {
    this.jobs.forEach((job, name) => {
      job.start();
      logger.info(`已重启定时任务: ${name}`);
    });
  }

  // 获取所有任务状态
  getStatus(): Array<{ name: string; running: boolean; nextRun: Date | null }> {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      running: job.running,
      nextRun: job.nextDate().toDate(),
    }));
  }
}

// 导出调度器实例
export const scheduler = Scheduler.getInstance();