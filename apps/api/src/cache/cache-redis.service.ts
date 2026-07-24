import { Injectable } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import type { Redis } from 'ioredis'

@Injectable()
export class CacheRedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    if (data === null) return null

    try {
      return JSON.parse(data) as T
    } catch (e) {
      console.warn(`Failed to parse cache value for key "${key}": ${e}`)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
    if (value === undefined || value === null) {
      console.warn(`Attempted to cache null/undefined value for key "${key}"`)
      return
    }

    const serialized = JSON.stringify(value)
    await this.redis.set(key, serialized, 'EX', ttlSeconds)
  }

  async delete(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
      await this.redis.del(...key)
    } else {
      await this.redis.del(key)
    }
  }
}
