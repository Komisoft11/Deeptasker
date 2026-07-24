import { Injectable } from '@nestjs/common'
import { CacheRedisService } from '../cache-redis.service'
import { TaskResponse } from '../../task/dto'
import { cacheKeyCreator } from '../../common/const/cache-keys.geneartors'

@Injectable()
export class TaskCacheService {
  constructor(private readonly cacheService: CacheRedisService) {}

  private static tasksKey(projectId: number) {
    return cacheKeyCreator('project', projectId, 'tasks')
  }

  public async set(projectId: number, value: TaskResponse[]): Promise<void> {
    await this.cacheService.set<TaskResponse[]>(TaskCacheService.tasksKey(projectId), value, 30)
  }

  public async get(projectId: number): Promise<TaskResponse[]> {
    return this.cacheService.get<TaskResponse[]>(TaskCacheService.tasksKey(projectId))
  }

  public async delete(projectId: number): Promise<void> {
    await this.cacheService.delete(TaskCacheService.tasksKey(projectId))
  }
}
