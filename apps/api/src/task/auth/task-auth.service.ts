import { Injectable } from '@nestjs/common'
import { UserModel } from '../../user/models/user.model'
import { GlobalRole } from '../../user/access/enum.role'
import { TaskModel } from '../models/task.model'
import { ProjectAuthService } from '../../project/auth/project-auth.service'
import { TaskUserModel } from '../access/models/task-user.model'
import { TaskCommentModel } from '../comment/models/task-comment.model'
import { TaskFileModel } from '../../file/models/task-file.model'
import { ProjectModel } from '../../project/models/project.model'
import { UpdateTaskRequest } from '../dto'

@Injectable()
export class TaskAuthService {
  public readonly modelAuth: TaskModelAuthService

  constructor(private readonly projectAuthService: ProjectAuthService) {
    this.modelAuth = new TaskModelAuthService(projectAuthService)
  }

  public async canRead(user: UserModel, taskId: number): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    // Checking that user is one of:
    // 1. Task creator/assigner/executor/observer
    // 2. Has project permission to read project's tasks

    return await TaskModel.query()
      .alias('t')
      .leftJoin('task_user as tu', builder => {
        builder.on('tu.taskId', 't.id').andOnVal('tu.userId', user.id)
      })
      .leftJoin('project_permissions as pp', builder => {
        builder.on('pp.projectId', 't.projectId').andOnVal('pp.userId', user.id)
      })
      .where('t.id', taskId)
      .andWhere(builder => {
        builder
          .where(b => {
            b.where('t.executorId', user.id) // executor
              .orWhere('t.userId', user.id) // creator
              .orWhere('t.assignerId', user.id) // assigner
              .orWhereNotNull('tu.userId') // observer
          })
          .orWhere('pp.openTasks', true) // project permission to read task
        //.orWhere('pp.controller', true) // project permission controller
      })
      .exists()
  }

  public async canUpdate(
    user: UserModel,
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest
  ): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    if (task.assignerId === user.id || task.userId === user.id) {
      return true
    }

    return this.projectAuthService.canUpdateTaskInfo(user, task.projectId, updateTaskDto)
  }

  public async canConfirm(user: UserModel, task: TaskModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin || task.assignerId === user.id || task.userId === user.id) {
      return true
    }

    return this.projectAuthService.canConfirmTaskExecution(user, task.projectId)
  }

  public async canExecute(user: UserModel, task: TaskModel): Promise<boolean> {
    if (task.executorId === user.id) {
      return true
    }

    return this.canConfirm(user, task)
  }

  public async canFinish(user: UserModel, task: TaskModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      task.executorId === user.id ||
      task.assignerId === user.id ||
      (await this.projectAuthService.canFinishTasks(user, task.projectId))
    )
  }

  public async canCreate(
    user: UserModel,
    project: ProjectModel,
    parentId?: number
  ): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    if (parentId && !(await this.canRead(user, parentId))) {
      return false
    }

    return await this.projectAuthService.canCreateTasks(user, project)
  }

  public async canManageTaskObservers(user: UserModel, task: TaskModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      task.assignerId === user.id ||
      (await this.projectAuthService.canManageTaskObservers(user, task.projectId))
    )
  }

  public async canReadTaskFile(user: UserModel, taskFile: TaskFileModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return taskFile.userId === user.id || (await this.canRead(user, taskFile.taskId))
  }

  public async canMove(user: UserModel, task: TaskModel, newParentId: number): Promise<boolean> {
    return (
      (newParentId ? await this.canRead(user, newParentId) : true) &&
      (await this.projectAuthService.canMoveTasks(user, { id: task.projectId }))
    )
  }

  public async canComment(user: UserModel, task: TaskModel): Promise<boolean> {
    const [isCreatorAssignerExecutorOrObserver, hasAdminRole, hasControllerRole] =
      await Promise.all([
        this.modelAuth.isCreatorAssignerExecutorOrObserver(user, task),
        this.projectAuthService.hasProjectRole(user, task.projectId, 'admin'),
        this.projectAuthService.hasProjectRole(user, task.projectId, 'controller')
      ])

    return isCreatorAssignerExecutorOrObserver || hasAdminRole || hasControllerRole
  }

  public async canCreateTimerHistoryEntry(user: UserModel, task: TaskModel): Promise<boolean> {
    return (
      task.executorId === user.id ||
      (await this.projectAuthService.canEditTaskTracking(user, task.projectId))
    )
  }
}

class TaskModelAuthService {
  private readonly projectAuthService: ProjectAuthService

  constructor(projectAuthService: ProjectAuthService) {
    this.projectAuthService = projectAuthService
  }

  public async canUpload(user: UserModel, task: TaskModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return this.isCreatorAssignerOrExecutor(user, task)
  }

  public async isCreatorAssignerExecutorOrObserver(
    user: UserModel,
    task: TaskModel
  ): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isCreatorAssignerOrExecutor(user, task) ||
      (await TaskUserModel.query().where('taskId', task.id).where('userId', user.id).exists())
    )
  }

  public canUpdateComment(user: UserModel, comment: TaskCommentModel): boolean {
    return user.id === comment.userId
  }

  public async canDeleteComment(user: UserModel, comment: TaskCommentModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      user.id === comment.userId ||
      (await this.projectAuthService.canDeleteComments(
        user,
        (
          await comment.$relatedQuery<TaskModel>('task').select('projectId').first()
        ).projectId
      ))
    )
  }

  private isCreatorAssignerOrExecutor(user: UserModel, task: TaskModel): boolean {
    return task.userId === user.id || task.executorId === user.id || task.assignerId === user.id
  }

  public async canDeleteTaskFile(user: UserModel, taskFile: TaskFileModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      taskFile.userId === user.id ||
      (await this.projectAuthService.canDeleteTaskFile(
        user,
        (
          await taskFile.$relatedQuery<TaskModel>('task').select('projectId').first()
        ).projectId
      ))
    )
  }

  public async canAssign(user: UserModel, task: TaskModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      task.assignerId === user.id ||
      (await this.projectAuthService.canAssignTasks(user, task.projectId))
    )
  }

  public async canChangeAssigner(user: UserModel, task: TaskModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return task.userId === user.id || (await this.canAssign(user, task))
  }

  public async canDelete(user: UserModel, task: TaskModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    const project: ProjectModel = await task.$relatedQuery('project')

    return (
      task.assignerId === user.id ||
      task.userId === user.id ||
      (await this.projectAuthService.canDeleteTasks(user, project))
    )
  }

  public async canMove(user: UserModel, task: TaskModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      task.assignerId === user.id ||
      (await this.projectAuthService.canMoveTasks(user, { id: task.projectId }))
    )
  }
}
