import { JDCrawler } from './jd';
import { TaobaoCrawler } from './taobao';
import { logger } from '../logger';
import { cacheService } from '../cache';
import { scheduler } from '../scheduler';

// 爬虫管理器类
export class CrawlerManager {
  private static instance: CrawlerManager;
  private crawlers: Map<string, any>;

  private constructor() {
    this.crawlers = new Map();
    this.initializeCrawlers();
  }

  // 单例模式
  public static getInstance(): CrawlerManager {
    if (!CrawlerManager.instance) {
      CrawlerManager.instance = new CrawlerManager();
    }
    return CrawlerManager.instance;
  }

  // 初始化爬虫
  private initializeCrawlers() {
    this.crawlers.set('JD', new JDCrawler());
    this.crawlers.set('Taobao', new TaobaoCrawler());
  }

  // 获取指定平台的爬虫
  private getCrawler(platform: string) {
    const crawler = this.crawlers.get(platform);
    if (!crawler) {
      throw new Error(`不支持的平台: ${platform}`);
    }
    return crawler;
  }

  // 从URL中识别平台
  private identifyPlatform(url: string): string {
    if (url.includes('jd.com')) return 'JD';
    if (url.includes('taobao.com')) return 'Taobao';
    throw new Error('不支持的商品URL');
  }

  // 获取商品信息
  async getProductInfo(url: string) {
    try {
      const platform = this.identifyPlatform(url);
      const crawler = this.getCrawler(platform);

      // 尝试从缓存获取
      const cacheKey = `product:${platform}:${url}`;
      const cachedProduct = await cacheService.get(cacheKey);
      if (cachedProduct) {
        return cachedProduct;
      }

      // 爬取商品信息
      const product = await crawler.getProductInfo(url);

      // 缓存商品信息（1小时）
      await cacheService.setWithTags(
        cacheKey,
        product,
        ['products', `platform:${platform}`],
        3600
      );

      return product;
    } catch (error) {
      logger.error('获取商品信息失败:', error);
      throw error;
    }
  }

  // 搜索商品
  async searchProducts(keyword: string, platforms: string[] = ['JD', 'Taobao']) {
    try {
      // 验证平台
      platforms.forEach(platform => {
        if (!this.crawlers.has(platform)) {
          throw new Error(`不支持的平台: ${platform}`);
        }
      });

      // 尝试从缓存获取
      const cacheKey = `search:${keyword}:${platforms.join(',')}`;
      const cachedResults = await cacheService.get(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }

      // 并行搜索所有平台
      const searchPromises = platforms.map(async platform => {
        try {
          const crawler = this.getCrawler(platform);
          const results = await crawler.searchProducts(keyword);
          return results.map(result => ({ ...result, platform }));
        } catch (error) {
          logger.error(`${platform} 搜索失败:`, error);
          return [];
        }
      });

      const results = await Promise.all(searchPromises);
      const flatResults = results.flat();

      // 缓存搜索结果（30分钟）
      await cacheService.setWithTags(
        cacheKey,
        flatResults,
        ['search', ...platforms.map(p => `platform:${p}`)],
        1800
      );

      return flatResults;
    } catch (error) {
      logger.error('搜索商品失败:', error);
      throw error;
    }
  }

  // 更新商品价格
  async updateProductPrice(productId: string) {
    try {
      // 获取商品信息
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          prices: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!product || !product.prices[0]) {
        throw new Error('商品不存在或无价格信息');
      }

      // 获取最新价格
      const latestPrice = await this.getProductInfo(product.prices[0].url);

      // 更新价格
      await prisma.price.create({
        data: {
          productId,
          price: latestPrice.price,
          originalPrice: latestPrice.originalPrice,
          currency: 'CNY',
          platform: product.prices[0].platform,
          url: product.prices[0].url,
          inStock: latestPrice.inStock,
        },
      });

      // 清除缓存
      await cacheService.deleteByTag(`product:${productId}`);

      return latestPrice;
    } catch (error) {
      logger.error('更新商品价格失败:', error);
      throw error;
    }
  }

  // 批量更新商品价格
  async batchUpdatePrices(productIds: string[]) {
    try {
      const results = await Promise.allSettled(
        productIds.map(id => this.updateProductPrice(id))
      );

      // 统计结果
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
      logger.error('批量更新价格失败:', error);
      throw error;
    }
  }

  // 注册定时更新任务
  async registerUpdateTask(productId: string, interval: number) {
    try {
      const jobName = `update-price:${productId}`;
      
      // 创建定时任务
      scheduler.registerJob(jobName, `*/${interval} * * * *`, async () => {
        try {
          await this.updateProductPrice(productId);
          logger.info(`商品 ${productId} 价格更新成功`);
        } catch (error) {
          logger.error(`商品 ${productId} 价格更新失败:`, error);
        }
      });

      return { message: '定时更新任务注册成功' };
    } catch (error) {
      logger.error('注册定时更新任务失败:', error);
      throw error;
    }
  }

  // 取消定时更新任务
  async unregisterUpdateTask(productId: string) {
    try {
      const jobName = `update-price:${productId}`;
      scheduler.unregisterJob(jobName);
      return { message: '定时更新任务已取消' };
    } catch (error) {
      logger.error('取消定时更新任务失败:', error);
      throw error;
    }
  }
}

// 导出爬虫管理器实例
export const crawlerManager = CrawlerManager.getInstance();