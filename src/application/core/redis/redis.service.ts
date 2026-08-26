// redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: RedisClientType,
  ) { }

  // 🔹 Basic SET with optional TTL
  async set(key: string, value: any, ttl?: number) {
    const data = JSON.stringify(value);

    if (ttl) {
      await this.client.set(key, data, { EX: ttl });
    } else {
      await this.client.set(key, data);
    }
  }

  async zadd(key: string, list: { score: number; value: string }[]) {
    const res = await this.client.zAdd(
      key,
      list.map(({ score, value }) => ({ score, value })),
    );
    return res;
  }

  async expire(key: string, ttl: number) {
    const res = await this.client.expire(key, ttl);
    return res;
  }

  async zrange(key: string, startIndex: number = 0, endIndex: number = -1) {
    const res = await this.client.zRange(key, startIndex, endIndex);
    return res;
  }

  async zremrangebyrank(key: string, startIndex: number, endIndex: number) {
    const res = await this.client.zRemRangeByRank(key, startIndex, endIndex);
    return res;
  }

  // 🔹 GET
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // 🔹 HGETALL
  async hgetall<T = { [x: string]: string }>(key: string): Promise<T | null> {
    const data: Record<string, string> = await this.client.hGetAll(key);
    return data ? (data as T) : null;
  }

  // 🔹 DELETE
  async del(key: string) {
    await this.client.del(key);
  }

  // 🔹 Batch execution (ARRAY OF COMMANDS ✅)
  async execBatch(commands: string[][]) {
    const multi = this.client.multi();

    for (const [command, ...args] of commands) {
      if (typeof multi[command] === 'function') {
        (multi[command] as any)(...args);
      } else {
        throw new Error(`Invalid Redis command: ${command}`);
      }
    }

    return multi.exec();
  }

  // 🔹 Safer batch builder
  async execBatchSafe(
    builder: (multi: ReturnType<RedisClientType['multi']>) => void,
  ) {
    const multi = this.client.multi();
    builder(multi);
    return multi.exec();
  }
}
