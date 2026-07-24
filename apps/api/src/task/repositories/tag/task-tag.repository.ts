import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { TagModel } from '../../tag/models/tag.model'
import { ITaskTagRepository } from './task-tag-repository.interface'
import { TaskModel } from '../../models/task.model'
import { TransactionOrKnex } from 'objection'
import { TaskTagModel } from '../../tag/models/task-tag.model'
import { CreateTagDto } from '../../tag/dto/in/create-tag.dto'
import { ProjectModel } from '../../../project/models/project.model'
import { UpdateTagDto } from '../../tag/dto/in/update-tag.dto'

@Injectable()
export class TaskTagRepository extends Repository<TagModel> implements ITaskTagRepository {
  @InjectModel(TagModel)
  model: TagModel

  public async createTag(createTagDto: CreateTagDto, project: ProjectModel): Promise<TagModel> {
    const name = createTagDto.name.trim()

    return TagModel.query().insert({
      name: name,
      color: createTagDto.color,
      projectId: project.id
    })
  }

  public async getTag(tagId: number): Promise<TagModel> {
    return TagModel.query().findById(tagId)
  }

  public async addToTask(task: TaskModel, tag: TagModel, trx?: TransactionOrKnex): Promise<void> {
    await TaskTagModel.query(trx)
      .insert({
        taskId: task.id,
        tagId: tag.id
      })
      .onConflict(['taskId', 'tagId'])
      .ignore()
  }

  public async removeFromTask(
    task: TaskModel,
    tag: TagModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await TaskTagModel.query(trx).delete().where({
      taskId: task.id,
      tagId: tag.id
    })
  }

  public async isTagExists(name: string, project: ProjectModel): Promise<boolean> {
    return TagModel.query().where('name', name).where('projectId', project.id).exists()
  }

  public async getByProject(projectId: number): Promise<TagModel[]> {
    return TagModel.query().where('projectId', projectId)
  }

  public async deleteTag(tagId: number, trx?: TransactionOrKnex): Promise<void> {
    await TagModel.query(trx).delete().andWhere('id', tagId)
  }

  public async updateTag(
    tag: TagModel,
    updateTagDto: UpdateTagDto,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await tag.$query(trx).patch({
      name: updateTagDto.name,
      color: updateTagDto.color
    })
  }

  public async getByIds(ids: number[]): Promise<TagModel[]> {
    return TagModel.query().whereIn('id', ids)
  }

  public async removeTagFromAllTasks(tag: TagModel, trx?: TransactionOrKnex): Promise<void> {
    await TaskTagModel.query(trx).where('tagId', tag.id).delete()
  }
}
