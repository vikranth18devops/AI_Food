import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private logger = new StructuredLogger('nutrition-service:redis');
  private client: Redis | null = null;

  async onModuleInit() {
    const config = loadAppConfig();
    try {
      this.client = new Redis(config.redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
      });
      await this.client.connect();
      this.logger.info('Successfully connected to Redis');
    } catch (err: any) {
      this.logger.warn(`Redis connection failed: ${err.message}. Operating without Redis cache.`);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 86400): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (e) {
      // Ignore cache write errors
    }
  }
}
