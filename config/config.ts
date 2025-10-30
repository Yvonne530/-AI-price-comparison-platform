import { z } from 'zod';

// 环境变量验证schema
const envSchema = z.object({
  // 数据库配置
  DATABASE_URL: z.string().url(),

  // JWT配置
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string(),

  // 邮件服务配置
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),

  // Redis配置
  REDIS_URL: z.string().url(),

  // 第三方API密钥
  OPENAI_API_KEY: z.string().optional(),
  SERPAPI_API_KEY: z.string().optional(),

  // 应用配置
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.string().transform(Number),
  API_URL: z.string().url(),
  WEBSITE_URL: z.string().url(),

  // 文件上传配置
  UPLOAD_DIR: z.string(),
  MAX_FILE_SIZE: z.string().transform(Number),

  // 爬虫配置
  CRAWLER_INTERVAL: z.string().transform(Number),
  CRAWLER_TIMEOUT: z.string().transform(Number),
  MAX_CONCURRENT_CRAWLS: z.string().transform(Number),

  // 安全配置
  CORS_ORIGINS: z.string(),
  RATE_LIMIT_WINDOW: z.string().transform(Number),
  RATE_LIMIT_MAX: z.string().transform(Number),

  // 缓存配置
  CACHE_TTL: z.string().transform(Number),
});

// 验证环境变量
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ 环境变量验证失败:', _env.error.format());
  throw new Error('环境变量验证失败');
}

export const config = {
  db: {
    url: _env.data.DATABASE_URL,
  },

  jwt: {
    secret: _env.data.JWT_SECRET,
    expiresIn: _env.data.JWT_EXPIRES_IN,
  },

  email: {
    host: _env.data.SMTP_HOST,
    port: _env.data.SMTP_PORT,
    user: _env.data.SMTP_USER,
    pass: _env.data.SMTP_PASS,
    from: _env.data.SMTP_FROM,
  },

  redis: {
    url: _env.data.REDIS_URL,
  },

  api: {
    openai: _env.data.OPENAI_API_KEY,
    serpapi: _env.data.SERPAPI_API_KEY,
  },

  app: {
    env: _env.data.NODE_ENV,
    port: _env.data.PORT,
    apiUrl: _env.data.API_URL,
    websiteUrl: _env.data.WEBSITE_URL,
  },

  upload: {
    dir: _env.data.UPLOAD_DIR,
    maxSize: _env.data.MAX_FILE_SIZE,
  },

  crawler: {
    interval: _env.data.CRAWLER_INTERVAL,
    timeout: _env.data.CRAWLER_TIMEOUT,
    maxConcurrent: _env.data.MAX_CONCURRENT_CRAWLS,
  },

  security: {
    corsOrigins: _env.data.CORS_ORIGINS.split(','),
    rateLimit: {
      window: _env.data.RATE_LIMIT_WINDOW,
      max: _env.data.RATE_LIMIT_MAX,
    },
  },

  cache: {
    ttl: _env.data.CACHE_TTL,
  },
} as const;

// 导出类型
export type Config = typeof config;