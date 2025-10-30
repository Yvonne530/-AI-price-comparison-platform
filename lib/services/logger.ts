import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { config } from '@/config/config';

// 日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 日志级别颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// 为winston添加颜色
winston.addColors(colors);

// 日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 开发环境的控制台格式
const developmentFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  format
);

// 创建日志文件的基本配置
const fileRotateTransport = (filename: string) => {
  return new winston.transports.DailyRotateFile({
    filename: path.join(config.app.logPath, `%DATE%-${filename}.log`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  });
};

// 创建日志记录器
class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    const transports = [
      // 错误日志
      fileRotateTransport('error'),
      // 信息日志
      fileRotateTransport('combined'),
    ];

    // 在开发环境下添加控制台输出
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: developmentFormat,
        })
      );
    }

    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      levels,
      format,
      transports,
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // 错误日志
  error(message: string, meta?: any) {
    this.logger.error(this.formatMessage(message, meta));
  }

  // 警告日志
  warn(message: string, meta?: any) {
    this.logger.warn(this.formatMessage(message, meta));
  }

  // 信息日志
  info(message: string, meta?: any) {
    this.logger.info(this.formatMessage(message, meta));
  }

  // HTTP请求日志
  http(message: string, meta?: any) {
    this.logger.http(this.formatMessage(message, meta));
  }

  // 调试日志
  debug(message: string, meta?: any) {
    this.logger.debug(this.formatMessage(message, meta));
  }

  // 格式化日志消息
  private formatMessage(message: string, meta?: any): string {
    if (meta) {
      return `${message} ${JSON.stringify(meta)}`;
    }
    return message;
  }

  // 记录API请求日志
  logApiRequest(req: any, res: any, responseTime: number) {
    const message = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.headers['x-forwarded-for'],
      userId: req.headers['x-user-id'],
    };

    if (res.statusCode >= 400) {
      this.error('API请求失败', message);
    } else {
      this.http('API请求', message);
    }
  }

  // 记录错误日志
  logError(error: Error, context?: string) {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    };

    this.error('应用程序错误', errorInfo);
  }

  // 记录性能日志
  logPerformance(operation: string, duration: number, meta?: any) {
    const performanceInfo = {
      operation,
      duration: `${duration}ms`,
      ...meta,
    };

    this.info('性能日志', performanceInfo);
  }

  // 记录安全事件
  logSecurityEvent(event: string, meta?: any) {
    const securityInfo = {
      event,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    this.warn('安全事件', securityInfo);
  }

  // 记录系统事件
  logSystemEvent(event: string, meta?: any) {
    const systemInfo = {
      event,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    this.info('系统事件', systemInfo);
  }
}

// 导出日志记录器实例
export const logger = Logger.getInstance();