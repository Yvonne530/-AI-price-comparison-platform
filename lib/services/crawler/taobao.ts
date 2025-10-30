import { BaseCrawler } from './base';
import { logger } from '../logger';
import { prisma } from '@/lib/prisma';
import { cacheService } from '../cache';

interface TaobaoProduct {
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
  shop: {
    name: string;
    rating: number;
  };
}

export class TaobaoCrawler extends BaseCrawler {
  constructor() {
    super('Taobao');
  }

  // 处理验证码和登录
  protected async handleCaptchaAndLogin(): Promise<void> {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      // 检查是否需要滑块验证
      const sliderSelector = '#nc_1_n1z';
      const hasSlider = await this.elementExists(sliderSelector);

      if (hasSlider) {
        logger.warn('检测到滑块验证，等待处理...');
        // 这里可以实现自动滑块验证的逻辑
        // 暂时等待人工处理
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      // 检查登录状态
      const loginSelector = '.login-info';
      const needLogin = await this.elementExists(loginSelector);

      if (needLogin) {
        logger.warn('需要登录，等待处理...');
        // 这里可以实现自动登录逻辑
        // 暂时等待人工处理
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    } catch (error) {
      logger.error('处理验证码和登录失败:', error);
      throw error;
    }
  }

  // 解析商品详情
  protected async parseProductDetails(): Promise<Partial<TaobaoProduct>> {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      // 等待商品信息加载
      await this.waitForSelector('.tb-main-title');

      // 提取商品信息
      const name = await this.extractText('.tb-main-title');
      const description = await this.extractText('.tb-detail-hd');
      const image = await this.extractAttribute('.tb-booth img', 'src');
      
      // 提取店铺信息
      const shopName = await this.extractText('.shop-name');
      const shopRatingText = await this.extractText('.shop-rating');
      const shopRating = parseFloat(shopRatingText) || 0;

      // 提取分类和品牌信息
      const category = await this.extractText('.tb-category');
      const brand = await this.extractText('.tb-brand');
      const model = await this.extractText('.tb-model');

      return {
        name,
        description,
        image,
        category,
        brand,
        model,
        shop: {
          name: shopName,
          rating: shopRating,
        },
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
      await this.waitForSelector('.tb-promo-price');

      // 提取价格信息
      const priceText = await this.extractText('.tb-promo-price .tb-rmb-num');
      const originalPriceText = await this.extractText('.tb-original-price');

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
      const stockText = await this.extractText('.tb-stock');
      return !stockText.includes('无货');
    } catch (error) {
      logger.error('检查商品库存失败:', error);
      return false;
    }
  }

  // 获取商品ID
  private extractProductId(url: string): string {
    const match = url.match(/id=(\d+)/);
    return match ? match[1] : '';
  }

  // 获取商品信息
  public async getProductInfo(url: string): Promise<TaobaoProduct> {
    try {
      // 初始化浏览器
      await this.initialize();

      // 访问商品页面
      await this.navigateToPage(url);

      // 处理验证码和登录
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
      const product: TaobaoProduct = {
        id,
        url,
        inStock,
        ...details,
        ...priceInfo,
      } as TaobaoProduct;

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
  public async searchProducts(keyword: string): Promise<TaobaoProduct[]> {
    try {
      // 初始化浏览器
      await this.initialize();

      // 访问搜索页面
      const searchUrl = `https://s.taobao.com/search?q=${encodeURIComponent(
        keyword
      )}`;
      await this.navigateToPage(searchUrl);

      // 处理验证码和登录
      await this.handleCaptchaAndLogin();

      // 等待搜索结果加载
      await this.waitForSelector('.item');

      // 提取搜索结果
      const products = await this.page!.evaluate(() => {
        return Array.from(document.querySelectorAll('.item')).map(item => {
          const link = item.querySelector('.pic-link') as HTMLAnchorElement;
          const img = item.querySelector('.pic img') as HTMLImageElement;
          const titleEl = item.querySelector('.title') as HTMLElement;
          const priceEl = item.querySelector('.price strong') as HTMLElement;
          const shopEl = item.querySelector('.shop') as HTMLElement;

          const url = link?.href || '';
          const idMatch = url.match(/id=(\d+)/);

          return {
            id: idMatch ? idMatch[1] : '',
            name: titleEl?.innerText.trim() || '',
            image: img?.src || '',
            price: parseFloat(priceEl?.innerText.replace(/[^\d.]/g, '') || '0'),
            url,
            shop: {
              name: shopEl?.innerText.trim() || '',
              rating: 0,
            },
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
  private async updateDatabase(product: TaobaoProduct) {
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