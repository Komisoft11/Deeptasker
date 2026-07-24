import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { TagModel } from '../../tag/models/tag.model'
import { TaskModel } from '../../models/task.model'
import { TransactionOrKnex } from 'objection'
import { CreateTagDto } from '../../tag/dto/in/create-tag.dto'
import { ProjectModel } from '../../../project/models/project.model'
import { UpdateTagDto } from '../../tag/dto/in/update-tag.dto'

export const TASK_TAG_REPOSITORY = 'task_tag_repository'

export interface ITaskTagRepository extends RepositoryContract<TagModel> {
  query<R = TagModel>(): CustomQueryBuilder<TagModel, R>

  createTag(createTagDto: CreateTagDto, project: ProjectModel): Promise<TagModel>

  getTag(tagId: number): Promise<TagModel>

  addToTask(task: TaskModel, tag: TagModel, trx?: TransactionOrKnex): Promise<void>

  removeFromTask(task: TaskModel, tag: TagModel, trx?: TransactionOrKnex): Promise<void>

  isTagExists(name: string, project: ProjectModel): Promise<boolean>

  getByProject(projectId: number): Promise<TagModel[]>

  deleteTag(tagId: number, trx?: TransactionOrKnex): Promise<void>

  updateTag(tag: TagModel, updateTagDto: UpdateTagDto): Promise<void>

  getByIds(ids: number[]): Promise<TagModel[]>

  removeTagFromAllTasks(tag: TagModel, trx?: TransactionOrKnex): Promise<void>
}
