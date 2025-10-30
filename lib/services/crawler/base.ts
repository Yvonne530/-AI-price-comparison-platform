import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from '../logger';
import { config } from '@/config/config';
import { retry } from '@/lib/utils';

// 基础爬虫类
export abstract class BaseCrawler {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  protected platform: string;

  constructor(platform: string) {
    this.platform = platform;
  }

  // 初始化浏览器
  protected async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
      });

      this.page = await this.browser.newPage();

      // 设置视口大小
      await this.page.setViewport({ width: 1920, height: 1080 });

      // 设置用户代理
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      // 启用JavaScript
      await this.page.setJavaScriptEnabled(true);

      // 设置超时
      await this.page.setDefaultNavigationTimeout(30000);
      await this.page.setDefaultTimeout(30000);

      logger.info(`已初始化 ${this.platform} 爬虫`);
    } catch (error) {
      logger.error(`初始化 ${this.platform} 爬虫失败:`, error);
      throw error;
    }
  }

  // 关闭浏览器
  protected async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info(`已关闭 ${this.platform} 爬虫`);
    }
  }

  // 访问页面
  protected async navigateToPage(url: string) {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      await retry(
        async () => {
          await this.page!.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000,
          });
        },
        3,
        1000
      );
    } catch (error) {
      logger.error(`访问页面失败: ${url}`, error);
      throw error;
    }
  }

  // 等待元素加载
  protected async waitForSelector(selector: string, timeout: number = 10000) {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      await this.page.waitForSelector(selector, { timeout });
    } catch (error) {
      logger.error(`等待元素超时: ${selector}`, error);
      throw error;
    }
  }

  // 提取文本内容
  protected async extractText(selector: string): Promise<string> {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      const element = await this.page.$(selector);
      if (!element) return '';

      const text = await this.page.evaluate(el => el.textContent, element);
      return (text || '').trim();
    } catch (error) {
      logger.error(`提取文本失败: ${selector}`, error);
      return '';
    }
  }

  // 提取属性值
  protected async extractAttribute(
    selector: string,
    attribute: string
  ): Promise<string> {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      const element = await this.page.$(selector);
      if (!element) return '';

      const value = await this.page.evaluate(
        (el, attr) => el.getAttribute(attr),
        element,
        attribute
      );
      return (value || '').trim();
    } catch (error) {
      logger.error(
        `提取属性失败: ${selector} [${attribute}]`,
        error
      );
      return '';
    }
  }

  // 检查元素是否存在
  protected async elementExists(selector: string): Promise<boolean> {
    if (!this.page) throw new Error('浏览器未初始化');

    try {
      const element = await this.page.$(selector);
      return !!element;
    } catch (error) {
      logger.error(`检查元素存在失败: ${selector}`, error);
      return false;
    }
  }

  // 处理验证码和登录
  protected abstract handleCaptchaAndLogin(): Promise<void>;

  // 解析商品详情
  protected abstract parseProductDetails(): Promise<any>;

  // 解析价格信息
  protected abstract parsePriceInfo(): Promise<any>;

  // 检查商品库存
  protected abstract checkStock(): Promise<boolean>;

  // 获取商品信息
  public abstract getProductInfo(url: string): Promise<any>;

  // 搜索商品
  public abstract searchProducts(keyword: string): Promise<any[]>;
}