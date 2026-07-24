import { Injectable, NotFoundException } from '@nestjs/common'
import { TaskModel } from '../models/task.model'
import { UserModel } from '../../user/models/user.model'
import { TaskRoleCode } from '../auth/task-access.role'
import { TaskUserModel } from './models/task-user.model'
import { TaskRoleModel } from './models/task-role.model'
import { ProjectService } from '../../project/services/project/project.service'
import { MyBaseModel } from '../../common/database/base.model'
import { EventService } from '../../events/event.service'

@Injectable()
export class TaskAccessService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly eventService: EventService
  ) {}

  public async giveAccess(
    task: TaskModel,
    userToGive: UserModel,
    code: TaskRoleCode,
    user: UserModel
  ) {
    const trx = await MyBaseModel.startTransaction()
    try {
      await TaskUserModel.query(trx)
        .insert({
          taskId: task.id,
          userId: userToGive.id,
          taskRoleId: await this.getTaskRoleId(code)
        })
        .onConflict(['taskId', 'userId', 'taskRoleId'])
        .ignore()

      if (!(await this.projectService.hasProjectAccess(userToGive, task.projectId))) {
        await this.projectService.giveGuestAccessToProject(
          await task.$relatedQuery('project'),
          userToGive.id,
          user,
          trx
        )
      }

      await trx.commit()

      this.eventService
        .sendEvent({
          userId: user.id,
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              update: {
                observers: {
                  add: [userToGive.getShortInfo()]
                }
              }
            }
          }
        })
        .then(() => {})
        .catch(e => {
          console.error(e)
        })
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async takeAccess(
    task: TaskModel,
    userToTake: UserModel,
    user: UserModel,
    code: TaskRoleCode
  ) {
    await TaskUserModel.query()
      .alias('tu')
      .innerJoinRelated('taskRole as tr')
      .where('tu.taskId', task.id)
      .where('tu.userId', userToTake.id)
      .where('tr.code', code)
      .delete()

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            update: {
              observers: {
                remove: [userToTake.getShortInfo()]
              }
            }
          }
        }
      })
      .then(() => {})
      .catch(e => {
        console.error(e)
      })
  }

  public async getTaskRoleId(code: TaskRoleCode): Promise<number> {
    const taskRole = await TaskRoleModel.query().findOne({ code: code }).select('id')
    if (!taskRole) {
      throw new NotFoundException(`Task code ${code} does not exist`)
    }

    return taskRole.id
  }
}