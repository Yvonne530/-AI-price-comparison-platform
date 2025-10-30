import { BaseCrawler } from './base';
import { logger } from '../logger';
import { prisma } from '@/lib/prisma';
import { cacheService } from '../cache';

interface JDProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  model: string;
  url: string;
  inStock: boolean;
}

export class JDCrawler extends BaseCrawler {
  constructor() {
    super('JD');
  }

  // 处理验证码和登录
  protected async handleCaptchaAndLogin(): Promise<void> {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      // 检查是否需要处理验证码
      const captchaSelector = '#captcha';
      const hasCaptcha = await this.elementExists(captchaSelector);

      if (hasCaptcha) {
        logger.warn('检测到验证码，等待人工处理...');
        // 在这里可以实现验证码处理逻辑，比如使用验证码识别服务
        // 暂时先等待一段时间
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      logger.error('处理验证码失败:', error);
      throw error;
    }
  }

  // 解析商品详情
  protected async parseProductDetails(): Promise<Partial<JDProduct>> {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      // 等待商品信息加载
      await this.waitForSelector('.sku-name');

      // 提取商品信息
      const name = await this.extractText('.sku-name');
      const description = await this.extractText('.news');
      const image = await this.extractAttribute('.goods-intro-pic img', 'src');
      const brand = await this.extractText('.brand-name');
      const category = await this.extractText('.crumb-wrap .item:last-child');
      const model = await this.extractText('.parameter2.p-parameter-list li:first-child');

      return {
        name,
        description,
        image,
        brand,
        category,
        model,
      };
    } catch (error) {
      logger.error('解析商品详情失败:', error);
      throw error;
    }
  }

  // 解析价格信息
  protected async parsePriceInfo(): Promise<{
    price: number;
    originalPrice: number;
  }> {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      // 等待价格信息加载
      await this.waitForSelector('.price');

      // 提取价格信息
      const priceText = await this.extractText('.price');
      const originalPriceText = await this.extractText('.original-price');

      // 解析价格
      const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
      const originalPrice = originalPriceText
        ? parseFloat(originalPriceText.replace(/[^\d.]/g, ''))
        : price;

      return { price, originalPrice };
    } catch (error) {
      logger.error('解析价格信息失败:', error);
      throw error;
    }
  }

  // 检查商品库存
  protected async checkStock(): Promise<boolean> {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      // 检查库存状态
      const stockStatus = await this.extractText('.store-prompt');
      return !stockStatus.includes('无货');
    } catch (error) {
      logger.error('检查商品库存失败:', error);
      return false;
    }
  }

  // 获取商品ID
  private extractProductId(url: string): string {
    const match = url.match(/\/(\d+)\.html/);
    return match ? match[1] : '';
  }

  // 获取商品信息
  public async getProductInfo(url: string): Promise<JDProduct> {
    try {
      // 初始化浏览器
      await this.initialize();

      // 访问商品页面
      await this.navigateToPage(url);

      // 处理可能的验证码
      await this.handleCaptchaAndLogin();

      // 获取商品ID
      const id = this.extractProductId(url);
      if (!id) throw new Error('无法提取商品ID');

      // 解析商品信息
      const [details, priceInfo, inStock] = await Promise.all([
        this.parseProductDetails(),
        this.parsePriceInfo(),
        this.checkStock(),
      ]);

      // 组合商品信息
      const product: JDProduct = {
        id,
        url,
        inStock,
        ...details,
        ...priceInfo,
      } as JDProduct;

      // 更新数据库
      await this.updateDatabase(product);

      return product;
    } catch (error) {
      logger.error('获取商品信息失败:', error);
      throw error;
    } finally {
      // 清理资源
      await this.cleanup();
    }
  }

  // 搜索商品
  public async searchProducts(keyword: string): Promise<JDProduct[]> {
    try {
      // 初始化浏览器
      await this.initialize();

      // 访问搜索页面
      const searchUrl = `https://search.jd.com/Search?keyword=${encodeURIComponent(
        keyword
      )}`;
      await this.navigateToPage(searchUrl);

      // 等待搜索结果加载
      await this.waitForSelector('.gl-item');

      // 提取搜索结果
      const products = await this.page!.evaluate(() => {
        return Array.from(document.querySelectorAll('.gl-item')).map(item => {
          const link = item.querySelector('.p-img a') as HTMLAnchorElement;
          const img = item.querySelector('.p-img img') as HTMLImageElement;
          const nameEl = item.querySelector('.p-name em') as HTMLElement;
          const priceEl = item.querySelector('.p-price strong') as HTMLElement;
          const shopEl = item.querySelector('.p-shop a') as HTMLElement;

          return {
            id: link?.href.match(/\/(\d+)\.html/)?.[1] || '',
            name: nameEl?.innerText.trim() || '',
            image: img?.src || '',
            price: parseFloat(priceEl?.innerText.replace(/[^\d.]/g, '') || '0'),
            url: link?.href || '',
            shop: shopEl?.innerText.trim() || '',
          };
        });
      });

      // 过滤无效结果
      return products.filter(p => p.id && p.name && p.price > 0);
    } catch (error) {
      logger.error('搜索商品失败:', error);
      throw error;
    } finally {
      // 清理资源
      await this.cleanup();
    }
  }

  // 更新数据库
  private async updateDatabase(product: JDProduct) {
    try {
      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          description: product.description,
          image: product.image,
          category: product.category,
          brand: product.brand,
          model: product.model,
          prices: {
            create: {
              price: product.price,
              originalPrice: product.originalPrice,
              currency: 'CNY',
              platform: this.platform,
              url: product.url,
              inStock: product.inStock,
            },
          },
        },
        create: {
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.image,
          category: product.category,
          brand: product.brand,
          model: product.model,
          prices: {
            create: {
              price: product.price,
              originalPrice: product.originalPrice,
              currency: 'CNY',
              platform: this.platform,
              url: product.url,
              inStock: product.inStock,
            },
          },
        },
      });

      // 清除相关缓存
      await cacheService.deleteByTag('products');
    } catch (error) {
      logger.error('更新数据库失败:', error);
      throw error;
    }
  }
}