import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { SprintModel } from '../model/sprint.model'
import { UserModel } from '../../user/models/user.model'
import { TransactionOrKnex } from 'objection'
import { CreateSprintDto } from '../dto/in/create-sprint.dto'
import { UpdateSprintDto } from '../dto/in/update-sprint.dto'
import { TasksSprintDto } from '../dto/in/tasks-sprint.dto'

export const SPRINT_REPOSITORY = 'sprint_repository'

export interface ISprintRepository extends RepositoryContract<SprintModel> {
  query<R = SprintModel>(): CustomQueryBuilder<SprintModel, R>

  createSprint(
    createSprintDto: CreateSprintDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<SprintModel>

  getSprint(id: number): Promise<SprintModel>

  updateSprint(
    sprint: SprintModel,
    updateSprintDto: UpdateSprintDto,
    trx?: TransactionOrKnex
  ): Promise<void>

  deleteSprint(sprint: SprintModel, trx?: TransactionOrKnex): Promise<any>

  getSprintsByProject(projectId: number): Promise<SprintModel[]>

  addTasks(
    sprint: SprintModel,
    tasksSprintDto: TasksSprintDto,
    trx?: TransactionOrKnex
  ): Promise<any>

  removeTasks(tasksSprintDto: TasksSprintDto, trx?: TransactionOrKnex): Promise<any>

  isSprintExistsInProject(title: string, projectId: number): Promise<boolean>
}
