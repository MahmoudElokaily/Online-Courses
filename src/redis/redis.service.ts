import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
  });

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }
}
