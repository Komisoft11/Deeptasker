import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { SpecialTaskStatusCode, TaskStatusModel } from '../../../task/models/task-status.model'
import { TransactionOrKnex } from 'objection'
import { UpdateStatusDto } from '../../dto/task-status/in/update-status.dto'
import { TaskDefaultStatusData } from '../../interfaces/task-status.interface'
import { ProjectModel } from '../../models/project.model'

export const TASK_STATUS_REPOSITORY = 'task_status_repository'

export interface ITaskStatusRepository extends RepositoryContract<TaskStatusModel> {
  query<R = TaskStatusModel>(): CustomQueryBuilder<TaskStatusModel, R>

  createTaskStatus(
    createStatusData: TaskDefaultStatusData,
    projectId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskStatusModel>

  getTaskStatusById(id: number): Promise<TaskStatusModel>

  updateTaskStatus(
    taskStatus: TaskStatusModel,
    updateStatusDto: UpdateStatusDto,
    trx?: TransactionOrKnex
  ): Promise<void>

  deleteStatus(id: number, trx?: TransactionOrKnex): Promise<void>

  getStatuesByProject(project: ProjectModel): Promise<TaskStatusModel[]>

  projectHasStatusId(projectId: number, statusId: number): Promise<boolean>

  getSpecialStatus(
    projectId: number,
    code: SpecialTaskStatusCode,
    trx?: TransactionOrKnex
  ): Promise<TaskStatusModel | undefined>

  isTitleExists(name: string, projectId: number): Promise<boolean>
}
