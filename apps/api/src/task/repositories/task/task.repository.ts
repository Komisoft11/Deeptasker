import { CustomQueryBuilder, InjectModel } from '@squareboat/nestjs-objection'
import { Injectable } from '@nestjs/common'
import { TaskModel } from '../../models/task.model'
import { ITaskRepository } from './task-repository.interface'
import { Repository } from '../../../common/database/repository'
import {
  FetchGraphOptions,
  raw,
  ref,
  ReferenceBuilder,
  RelationExpression,
  TransactionOrKnex
} from 'objection'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { DataBaseException } from '../../../exceptions/DataBaseException'
import { CreateTaskRequest, UpdateTaskRequest } from '../../dto'
import { ProjectModel } from '../../../project/models/project.model'
import { UserModel } from '../../../user/models/user.model'
import { TaskStatusModel } from '../../models/task-status.model'
import { WorkspaceModel } from '../../../workspace/models/workspace.model'
import { TaskCommentModel } from '../../comment/models/task-comment.model'
import {
  IReportFields,
  ITaskExecutionReportFieldsMap,
  ITaskExecutionReportRequestData
} from '../../../report/interfaces/report.interface'
import { TaskRoleModel } from '../../access/models/task-role.model'
import { TaskRoleCode } from '../../auth/task-access.role'
import { TaskUserModel } from '../../access/models/task-user.model'
import { generateTaskExternalId } from '../../../common/helpers/extrenal-id'

@Injectable()
export class TaskRepository extends Repository<TaskModel> implements ITaskRepository {
  @InjectModel(TaskModel)
  model: TaskModel

  public static readonly Priorities = {
    None: 0,
    Low: 1,
    Mid: 2,
    High: 3
  }

  public async createTask(
    createTaskDto: CreateTaskRequest,
    userId: number,
    projectId: number,
    statusId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskModel> {
    const externalId = await this.getExternalId(projectId, trx)

    return TaskModel.query(trx)
      .insert({
        deadlineDate: createTaskDto.deadlineDate,
        title: createTaskDto.title,
        content: createTaskDto.content,
        projectId: projectId,
        executorId: createTaskDto.executorId,
        userId: userId,
        priority: createTaskDto.priority ?? TaskRepository.Priorities.None,
        statusId: statusId,
        folderId: createTaskDto.folderId,
        externalId: externalId
      })
      .withGraphFetched(
        '[user(selectShort), assigner(selectShortColor), executor(selectShortColor), timers(seconds), status, subtasks(selectId,notDeleted), tags]'
      )
  }

  public async getUnfinishedSubtasks(
    taskId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskModel[]> {
    return TaskModel.relatedQuery('subtasks', trx)
      .for(taskId)
      .where('dateFinished', null)
      .andWhere('dateDeleted', null)
  }

  public async getTask(taskId: number, trx?: TransactionOrKnex): Promise<TaskModel> {
    return TaskModel.query(trx).findOne({ id: taskId, dateDeleted: null })
  }

  public async getTaskByExternalId(
    projectId: number,
    externalId: string,
    trx?: TransactionOrKnex
  ): Promise<TaskModel> {
    return TaskModel.query(trx).findOne({ externalId, projectId, dateDeleted: null })
  }

  public async getFinishedTasksByTask(
    taskId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskModel[]> {
    return TaskModel.query(trx).where('finishedByTaskId', taskId).where('dateDeleted', null)
  }

  // TODO create a function that combines with above function
  public async backToWorkTasks(taskIds: number[], trx?: TransactionOrKnex): Promise<void> {
    await TaskModel.query(trx)
      .patch({
        finishedByTaskId: null,
        dateFinished: null
      })
      .whereIn('id', taskIds)
  }

  public async getLastStatusOrder(projectId: number, statusId: number): Promise<number> {
    const lastTask = await TaskModel.query()
      .select('statusOrder')
      .where('projectId', projectId)
      .where('statusId', statusId)
      .orderBy('statusOrder', 'DESC')
      .limit(1)
      .first()

    return lastTask ? lastTask.statusOrder + 1 : 1
  }

  public async changeFolder(
    taskId: number,
    folderId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await TaskModel.query(trx).patch({ folderId: folderId }).where('id', taskId)
  }

  public async changeChildrenFolder(
    taskId: number,
    folderId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    try {
      await TaskModel.query(trx).where('parentId', taskId).andWhere('dateDeleted', null).patch({
        folderId: folderId
      })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async deleteTask(taskId: number, trx?: TransactionOrKnex): Promise<void> {
    await TaskModel.query(trx).findById(taskId).patch({
      dateDeleted: getCurrentUTCDateTime()
    })
  }

  public async deleteSubTasks(taskId: number, trx?: TransactionOrKnex): Promise<void> {
    const subTaskIds = (
      await TaskModel.query(trx)
        .select('id')
        .where('parentId', taskId)
        .andWhere('dateDeleted', null)
    ).map(t => t.id)

    if (subTaskIds.length === 0) {
      return
    }

    await TaskModel.query(trx)
      .patch({
        dateDeleted: getCurrentUTCDateTime(),
        activeDate: null,
        deletedByTaskId: taskId
      })
      .whereIn('id', subTaskIds)

    for (const subTaskId of subTaskIds) {
      await Promise.all([this.deleteSubTasks(subTaskId, trx)])
    }
  }

  public async getFullTask(taskId: number): Promise<TaskModel> {
    const fullTask = await this.query()
      .withGraphJoined(
        '[user(selectShortColor), assigner(selectShortColor), executor(selectShortColor)]'
      )
      .where(TaskModel.ref('id'), taskId)
      .where(TaskModel.ref('dateDeleted'), null)
      .first()

    await fullTask.$fetchGraph(
      '[' +
        'timers(seconds, userId), ' +
        'invited.[user(selectShort), taskRole], ' +
        'subtasks(selectId,notDeleted), ' +
        'files, ' +
        ']'
    )

    return fullTask
  }

  public async getTasksByProject(project: ProjectModel): Promise<TaskModel[]> {
    let tasksQuery: CustomQueryBuilder<TaskModel, any> = TaskModel.query()

    tasksQuery = tasksQuery
      .alias('t')
      .withGraphJoined(
        '[user(selectShort), assigner(selectShortColor), executor(selectShortColor), timers(seconds), status]'
      )
      .withGraphJoined('[subtasks(selectId,notDeleted), tags]')
      .where(TaskModel.ref('t.projectId'), project.id)
      .where(TaskModel.ref('t.dateDeleted'), null)
      .orderBy('t.custom_order')

    return tasksQuery
  }

  public async setAsUnFinishedTask(
    task: TaskModel,
    openStatusId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await task.$query(trx).patch({
      dateFinished: null,
      finishedByTaskId: null,
      statusId: openStatusId
    })
  }

  public async isTaskExists(taskId: number, trx?: TransactionOrKnex): Promise<boolean> {
    return TaskModel.query(trx).where('id', taskId).andWhere('dateDeleted', null).exists()
  }

  public async changeExecutor(
    task: TaskModel,
    userToAssignId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await task.$query(trx).patch({
      executorId: userToAssignId
    })
  }

  public async simpleUpdateStatus(
    task: TaskModel,
    statusId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await task.$query(trx).patch({ statusId: statusId })
  }

  public async updateTaskFields(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    trx: TransactionOrKnex
  ): Promise<void> {
    await task.$query(trx).patch(updateTaskDto)
  }

  public async hasAncestor(taskId: number, ancestorId: number): Promise<boolean> {
    const result = await TaskModel.query()
      .withRecursive('ancestor_path', qb => {
        qb.select('id', 'parent_id', raw('ARRAY[id]::integer[]').as('path'))
          .from('task')
          .where('id', taskId)
          .unionAll(qb2 => {
            qb2
              .select('t.id', 't.parent_id', raw('ap.path || t.id').as('path'))
              .from('task as t')
              .innerJoin('ancestor_path as ap', 't.id', 'ap.parent_id')
              .whereNot(raw('t.id = ANY(ap.path)'))
          })
      })
      .select('*')
      .from('ancestor_path')
      .where('id', ancestorId)

    return result.length > 0
  }

  public async getStatus(task: TaskModel, trx?: TransactionOrKnex): Promise<TaskStatusModel> {
    return task.$relatedQuery('status', trx)
  }

  public async getProject(task: TaskModel, trx?: TransactionOrKnex): Promise<ProjectModel> {
    return task.$relatedQuery('project', trx)
  }

  public async getWorkspace(task: TaskModel, trx?: TransactionOrKnex): Promise<WorkspaceModel> {
    const project = await task.$relatedQuery('project', trx)
    return project.$relatedQuery('workspace', trx)
  }

  public async getExecutor(task: TaskModel, trx?: TransactionOrKnex): Promise<UserModel> {
    return task.$relatedQuery('executor', trx)
  }

  public async getAssigner(task: TaskModel, trx?: TransactionOrKnex): Promise<UserModel> {
    return task.$relatedQuery('assigner', trx)
  }

  public async getSubtasks(task: TaskModel, trx?: TransactionOrKnex): Promise<TaskModel[]> {
    return task.$relatedQuery('subtasks', trx)
  }

  public async getComment(
    taskCommentId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskCommentModel> {
    return TaskCommentModel.query(trx).findById(taskCommentId)
  }

  public async fetchGraph(
    task: TaskModel,
    expression: RelationExpression<TaskModel>,
    options?: FetchGraphOptions
  ): Promise<CustomQueryBuilder<TaskModel, TaskModel>> {
    return task.$fetchGraph(expression, options)
  }

  public async isAllSiblingsFinished(task: TaskModel, trx: TransactionOrKnex): Promise<boolean> {
    return !(await TaskModel.query(trx)
      .where('parentId', task.parentId)
      .andWhere('dateDeleted', null)
      .andWhere('dateFinished', null)
      .exists())
  }

  public async removeFolder(task: TaskModel, trx?: TransactionOrKnex): Promise<void> {
    await task.$query(trx).patch({
      folderId: null
    })
  }

  public async getTasksWithReportFields(
    reportRequest: ITaskExecutionReportRequestData
  ): Promise<TaskModel[]> {
    const { periodStart, periodEnd, projectId, fields, statuses } = reportRequest
    const dateInterval: [Date, Date] = [periodStart, periodEnd]

    const { selectedColumns, expressionGraphJoin } = this.extractFields(fields)

    return TaskModel.query()
      .alias('t')
      .select(selectedColumns)
      .whereIn('t.statusId', statuses)
      .andWhere('t.projectId', projectId)
      .andWhere('t.dateDeleted', null)
      .andWhere(builder => {
        builder.whereBetween('t.dateCreated', dateInterval)
        builder.orWhereBetween('t.dateFinished', dateInterval)
        builder.orWhereBetween('t.dateUpdated', dateInterval)
        builder.orWhereBetween('t.dateSentForReview', dateInterval)
      })
      .withGraphJoined(expressionGraphJoin)
      .modifiers({
        userInfo: builder => {
          builder.select([ref('id'), ref('firstName'), ref('lastName')])
        },
        fileInfo: builder => {
          builder.select([ref('id'), ref('filePath')])
        },
        selectTagInfo: builder => {
          builder.select([ref('id'), ref('name'), ref('color')])
        },
        selectStatusInfo: builder => {
          builder.select([ref('id'), ref('name'), ref('code'), ref('color')])
        }
      })
      .orderBy('t.id')
  }

  public async getByStatus(statusId: number, isOnlyRoot?: boolean): Promise<TaskModel[]> {
    const query = TaskModel.query().where('statusId', statusId).andWhere('dateDeleted', null)

    if (isOnlyRoot) {
      query.andWhere('parentId', null)
    }

    return query
  }

  public async getByIds(ids: number[], projectId: number): Promise<TaskModel[]> {
    return TaskModel.query()
      .withGraphJoined('[status, subtasks, invited]')
      .alias('t')
      .whereIn('t.id', ids)
      .andWhere('t.projectId', projectId)
      .andWhere('t.dateDeleted', null)
      .orderBy('dateCreated', 'asc')
  }

  public async updateTasksStatus(
    tasksIds: number[],
    statusId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await TaskModel.query(trx).whereIn('id', tasksIds).patch({
      statusId: statusId
    })
  }

  public async isTitleExists(
    title: string,
    projectId: number,
    trx: TransactionOrKnex
  ): Promise<boolean> {
    return TaskModel.query(trx)
      .where('title', title)
      .andWhere('projectId', projectId)
      .andWhere('dateDeleted', null)
      .exists()
  }

  public async updateObservers(
    task: TaskModel,
    observerIds: number[],
    trx?: TransactionOrKnex
  ): Promise<void> {
    const observerRole = await TaskRoleModel.query(trx).where('code', TaskRoleCode.observer).first()

    await Promise.all(
      observerIds.map(observerId =>
        TaskUserModel.query(trx).insert({
          taskId: task.id,
          userId: observerId,
          taskRoleId: observerRole.id
        })
      )
    )
  }

  public async getTasksStatus(sourceStatusId: number, projectId: number): Promise<TaskModel[]> {
    return TaskModel.query()
      .where('statusId', sourceStatusId)
      .andWhere('projectId', projectId)
      .andWhere('dateDeleted', null)
      .withGraphFetched('[status]')
  }

  public async getLatestExternalId(
    projectId: number,
    trx?: TransactionOrKnex
  ): Promise<string | undefined> {
    const taskModel = await TaskModel.query(trx)
      .select('externalId')
      .where('projectId', projectId)
      .orderBy('dateCreated', 'DESC')
      .first()

    return taskModel?.externalId
  }

  private extractFields(fields: IReportFields) {
    return {
      selectedColumns: this.extractTaskColumns(fields),
      expressionGraphJoin: this.getGraphsByFields(fields)
    }
  }

  private getGraphsByFields(fields: IReportFields) {
    const relationsMap: ITaskExecutionReportFieldsMap = {
      tags: 'tags(selectTagInfo)',
      observers: 'invited.[user(userInfo)]',
      fileLinks: 'files(fileInfo)',
      executor: 'executor(userInfo)',
      assigner: 'assigner(userInfo)',
      status: 'status(selectStatusInfo)',
      creator: 'user(userInfo)',
      spentTime: 'timers.[user(userInfo)]'
    }

    const expressions = Object.keys(fields).reduce((acc: string[], key) => {
      if (relationsMap[key]) {
        acc.push(relationsMap[key])
      }

      return acc
    }, [])

    return `[${expressions.join(',')}]`
  }

  private extractTaskColumns(fields: IReportFields) {
    const columnMap: ITaskExecutionReportFieldsMap = {
      dateCreated: 't.dateCreated',
      description: 't.content',
      timeEstimate: 't.estimatedTime',
      dateDeadline: 't.deadlineDate',
      name: 't.title',
      dateExecuted: 't.dateFinished'
    }

    if (!fields.dateDeadline && fields.timeExpired) {
      columnMap.timeExpired = 't.deadlineDate'
    }

    return Object.keys(columnMap).reduce(
      (acc, key) => {
        if (fields[key as keyof IReportFields]) {
          acc.push(ref(columnMap[key]) as ReferenceBuilder)
        }

        return acc
      },
      [ref('t.id')] as ReferenceBuilder[]
    )
  }

  private async getExternalId(projectId: number, trx: TransactionOrKnex): Promise<string> {
    const query = TaskModel.query(trx)
      .select('externalId')
      .where('projectId', projectId)
      .orderBy('id', 'desc')
      .first()

    const latestExternalId = (await query)?.externalId

    if (latestExternalId) {
      const split = latestExternalId.split('-')
      split[split.length - 1] = String(Number(split[split.length - 1]) + 1)
      return split.join('-')
    }

    const { slug } = await ProjectModel.query(trx).select('slug').findOne('id', projectId)

    return generateTaskExternalId(slug, 1)
  }
}
