import { Redis } from '@upstash/redis';
import { config } from '@/config/config';

// 创建Redis客户端
const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
});

// 缓存键前缀
const CACHE_PREFIX = 'price-comparison:';

// 默认缓存时间（1小时）
const DEFAULT_TTL = 3600;

// 缓存服务类
export class CacheService {
  private static instance: CacheService;
  private constructor() {}

  // 单例模式
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // 生成缓存键
  private generateKey(key: string): string {
    return `${CACHE_PREFIX}${key}`;
  }

  // 设置缓存
  async set(
    key: string,
    value: any,
    ttl: number = DEFAULT_TTL
  ): Promise<void> {
    const cacheKey = this.generateKey(key);
    try {
      await redis.set(cacheKey, JSON.stringify(value), { ex: ttl });
    } catch (error) {
      console.error('缓存设置失败:', error);
      throw error;
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.generateKey(key);
    try {
      const value = await redis.get(cacheKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('缓存获取失败:', error);
      return null;
    }
  }

  // 删除缓存
  async delete(key: string): Promise<void> {
    const cacheKey = this.generateKey(key);
    try {
      await redis.del(cacheKey);
    } catch (error) {
      console.error('缓存删除失败:', error);
      throw error;
    }
  }

  // 设置带标签的缓存
  async setWithTags(
    key: string,
    value: any,
    tags: string[],
    ttl: number = DEFAULT_TTL
  ): Promise<void> {
    const cacheKey = this.generateKey(key);
    try {
      await Promise.all([
        redis.set(cacheKey, JSON.stringify(value), { ex: ttl }),
        ...tags.map(tag =>
          redis.sadd(this.generateKey(`tag:${tag}`), cacheKey)
        ),
      ]);
    } catch (error) {
      console.error('带标签的缓存设置失败:', error);
      throw error;
    }
  }

  // 通过标签删除缓存
  async deleteByTag(tag: string): Promise<void> {
    const tagKey = this.generateKey(`tag:${tag}`);
    try {
      const keys = await redis.smembers(tagKey);
      if (keys.length > 0) {
        await Promise.all([
          redis.del(...keys),
          redis.del(tagKey),
        ]);
      }
    } catch (error) {
      console.error('通过标签删除缓存失败:', error);
      throw error;
    }
  }

  // 批量设置缓存
  async mset(
    items: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<void> {
    try {
      await Promise.all(
        items.map(({ key, value, ttl = DEFAULT_TTL }) =>
          this.set(key, value, ttl)
        )
      );
    } catch (error) {
      console.error('批量设置缓存失败:', error);
      throw error;
    }
  }

  // 批量获取缓存
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const cacheKeys = keys.map(key => this.generateKey(key));
      const values = await redis.mget(...cacheKeys);
      return values.map(value => (value ? JSON.parse(value) : null));
    } catch (error) {
      console.error('批量获取缓存失败:', error);
      return keys.map(() => null);
    }
  }

  // 设置分布式锁
  async lock(
    key: string,
    ttl: number = 30
  ): Promise<boolean> {
    const lockKey = this.generateKey(`lock:${key}`);
    try {
      return await redis.set(lockKey, '1', {
        nx: true,
        ex: ttl,
      }) !== null;
    } catch (error) {
      console.error('设置分布式锁失败:', error);
      return false;
    }
  }

  // 释放分布式锁
  async unlock(key: string): Promise<void> {
    const lockKey = this.generateKey(`lock:${key}`);
    try {
      await redis.del(lockKey);
    } catch (error) {
      console.error('释放分布式锁失败:', error);
      throw error;
    }
  }
}

// 导出缓存服务实例
export const cacheService = CacheService.getInstance();