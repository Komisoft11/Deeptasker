import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { TaskModel } from '../../models/task.model'
import { FetchGraphOptions, RelationExpression, TransactionOrKnex } from 'objection'
import { CreateTaskRequest, UpdateTaskRequest } from '../../dto'
import { UserModel } from '../../../user/models/user.model'
import { ProjectModel } from '../../../project/models/project.model'
import { TaskStatusModel } from '../../models/task-status.model'
import { WorkspaceModel } from '../../../workspace/models/workspace.model'
import { TaskCommentModel } from '../../comment/models/task-comment.model'
import { ITaskExecutionReportRequestData } from '../../../report/interfaces/report.interface'

export const TASK_REPOSITORY = 'task_repository'

export interface ITaskRepository extends RepositoryContract<TaskModel> {
  query<R = TaskModel>(): CustomQueryBuilder<TaskModel, R>

  createTask(
    createTaskDto: CreateTaskRequest,
    userId: number,
    projectId: number,
    statusId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskModel>

  getUnfinishedSubtasks(taskId: number, trx?: TransactionOrKnex): Promise<TaskModel[]>

  getTask(taskId: number, trx?: TransactionOrKnex): Promise<TaskModel>

  getTaskByExternalId(
    projectId: number,
    externalId: string,
    trx?: TransactionOrKnex
  ): Promise<TaskModel>

  getFinishedTasksByTask(taskId: number, trx?: TransactionOrKnex): Promise<TaskModel[]>

  backToWorkTasks(taskIds: number[], trx?: TransactionOrKnex): Promise<void>

  getLastStatusOrder(projectId: number, statusId: number): Promise<number>

  changeFolder(taskId: number, folderId: number, trx?: TransactionOrKnex): Promise<void>

  changeChildrenFolder(taskId: number, folderId: number, trx?: TransactionOrKnex): Promise<void>

  deleteTask(taskId: number, trx?: TransactionOrKnex): Promise<void>

  deleteSubTasks(taskId: number, trx?: TransactionOrKnex): Promise<void>

  getFullTask(taskId: number): Promise<TaskModel>

  getTasksByProject(project: ProjectModel): Promise<TaskModel[]>

  setAsUnFinishedTask(task: TaskModel, openStatusId: number, trx?: TransactionOrKnex): Promise<void>

  isTaskExists(taskId: number, trx?: TransactionOrKnex): Promise<boolean>

  changeExecutor(task: TaskModel, userToAssignId: number, trx?: TransactionOrKnex): Promise<void>

  simpleUpdateStatus(task: TaskModel, statusId: number, trx?: TransactionOrKnex): Promise<void>

  updateTaskFields(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    trx: TransactionOrKnex
  ): Promise<void>

  hasAncestor(taskId: number, ancestorId: number): Promise<boolean>

  getStatus(task: TaskModel, trx?: TransactionOrKnex): Promise<TaskStatusModel>

  getProject(task: TaskModel, trx?: TransactionOrKnex): Promise<ProjectModel>

  getWorkspace(task: TaskModel, trx?: TransactionOrKnex): Promise<WorkspaceModel>

  getExecutor(task: TaskModel, trx?: TransactionOrKnex): Promise<UserModel>

  getAssigner(task: TaskModel, trx?: TransactionOrKnex): Promise<UserModel>

  getSubtasks(task: TaskModel, trx?: TransactionOrKnex): Promise<TaskModel[]>

  getComment(taskCommentId: number, trx?: TransactionOrKnex): Promise<TaskCommentModel>

  fetchGraph(
    task: TaskModel,
    expression: RelationExpression<TaskModel>,
    options?: FetchGraphOptions
  ): Promise<CustomQueryBuilder<TaskModel, TaskModel>>

  isAllSiblingsFinished(task: TaskModel, trx: TransactionOrKnex): Promise<boolean>

  removeFolder(task: TaskModel, trx?: TransactionOrKnex): Promise<void>

  getByIds(ids: number[], projectId: number): Promise<TaskModel[]>

  updateTasksStatus(tasksIds: number[], statusId: number, trx?: TransactionOrKnex): Promise<void>

  getTasksWithReportFields(reportRequest: ITaskExecutionReportRequestData): Promise<TaskModel[]>

  getByStatus(statusId: number, isOnlyRoot?: boolean): Promise<TaskModel[]>

  isTitleExists(title: string, projectId: number, trx: TransactionOrKnex): Promise<boolean>

  updateObservers(task: TaskModel, observerIds: number[], trx?: TransactionOrKnex): Promise<void>

  getTasksStatus(sourceStatusId: number, projectId: number): Promise<TaskModel[]>

  getLatestExternalId(projectId: number, trx?: TransactionOrKnex): Promise<string | undefined>
}
