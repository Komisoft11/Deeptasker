import { Global, Module } from '@nestjs/common'
import { RedisModule } from '@nestjs-modules/ioredis'
import { ConfigService } from '@nestjs/config'
import { CacheRedisService } from './cache-redis.service'
import { ProjectCacheService } from './services/project.cache-service'
import { TaskCacheService } from './services/task.cache-service'

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'single',
        options: {
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: config.getOrThrow<number>('REDIS_PORT')
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [CacheRedisService, ProjectCacheService, TaskCacheService],
  exports: [ProjectCacheService, TaskCacheService]
})
export class cacheRedisModule {}
