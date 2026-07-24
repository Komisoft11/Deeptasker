import { Test, TestingModule } from '@nestjs/testing'
import { TaskService } from './task.service'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { TaskModel } from '../models/task.model'
import { ITaskRepository, TASK_REPOSITORY } from '../repositories/task/task-repository.interface'
import { TransactionOrKnex } from 'objection'
import { createMapper } from '@automapper/core'
import { classes } from '@automapper/classes'
import { MyBaseModel } from '../../common/database/base.model'
import { Knex } from '@mikro-orm/postgresql'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { UserModel } from '../../user/models/user.model'

describe('TaskService', () => {
  let taskService: TaskService
  let taskRepository: DeepMocked<ITaskRepository>

  const createTask = (
    id: number,
    isFinished: boolean = false,
    finishedByTaskId?: number
  ): TaskModel => {
    // @ts-ignore
    return createMock<TaskModel>({
      id: id,
      dateFinished: isFinished ? getCurrentUTCDateTime() : null,
      finishedByTaskId: isFinished ? finishedByTaskId ?? null : null,

      $query(trxOrKnex?: TransactionOrKnex): any {
        return {
          patch: async (obj?: object): Promise<any> => {
            Object.assign(this, obj)
            return this
          }
        }
      }
    })
  }

  beforeEach(async () => {
    jest
      .spyOn(MyBaseModel, 'startTransaction')
      .mockImplementation(async (): Promise<Knex.Transaction> => {
        return {
          commit: () => {},
          rollback: () => {}
        } as Knex.Transaction
      })

    taskRepository = createMock<ITaskRepository>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: TASK_REPOSITORY,
          useValue: taskRepository
        },
        {
          provide: 'automapper:nestjs:default',
          useValue: createMapper({
            strategyInitializer: classes()
          })
        }
      ]
    })
      .useMocker(createMock)
      .compile()

    taskService = module.get<TaskService>(TaskService)
  })

  describe('finish', () => {
    it('should finish task and all unfinished subtasks', async () => {
      const task = createTask(1)
      const subtasks1: TaskModel[] = [createTask(2), createTask(3)]
      const subtasks2: TaskModel[] = [createTask(4), createTask(5)]
      const subtasks3: TaskModel[] = [createTask(6), createTask(7)]

      taskRepository.getTask.mockResolvedValueOnce(task)

      taskRepository.getUnfinishedSubtasks.mockImplementation(
        async (taskId: number, em?: TransactionOrKnex): Promise<TaskModel[]> => {
          switch (taskId) {
            case 1:
              return subtasks1
            case 2:
              return subtasks2
            case 3:
              return subtasks3
            default:
              return []
          }
        }
      )

      await taskService.finish(task, { id: 1 } as UserModel, new Date())
      expect(task.dateFinished).toBeDefined()

      subtasks1.forEach(subtask => {
        expect(subtask.dateFinished).toBeDefined()
        expect(subtask.finishedByTaskId).toEqual(1)
      })

      subtasks2.forEach(subtask => {
        expect(subtask.dateFinished).toBeDefined()
        expect(subtask.finishedByTaskId).toEqual(1)
      })

      subtasks3.forEach(subtask => {
        expect(subtask.dateFinished).toBeDefined()
        expect(subtask.finishedByTaskId).toEqual(1)
      })
    })
  })

  describe('backToWork', () => {
    it('should return to work task and all finished subtasks by that task', async () => {
      const task = createTask(1, true)

      const tasksFinishedBy1: TaskModel[] = [
        createTask(2, true, 1),
        createTask(3, true, 1),
        createTask(4, true, 1),
        createTask(5, true, 1),
        createTask(6, true, 1),
        createTask(7, true, 1)
      ]

      taskRepository.getTask.mockResolvedValueOnce(task)

      taskRepository.getFinishedTasksByTask.mockImplementation(
        async (taskId: number, em?: TransactionOrKnex): Promise<TaskModel[]> => {
          switch (taskId) {
            case 1:
              return tasksFinishedBy1
            default:
              return []
          }
        }
      )

      taskRepository.backToWorkTasks.mockImplementation(
        async (taskIds: number[], em?: TransactionOrKnex): Promise<void> => {
          return taskIds.forEach(taskId =>
            tasksFinishedBy1
              .find(t => t.id === taskId)
              ?.$query(em)
              .patch({
                dateFinished: null,
                finishedByTaskId: null
              })
          )
        }
      )

      await taskService.backToWork(task.id, { id: 1 } as UserModel)

      expect(task.dateFinished).toBeNull()
      expect(task.finishedByTaskId).toBeNull()

      tasksFinishedBy1.forEach(subtask => {
        expect(subtask.dateFinished).toBeNull()
        expect(subtask.finishedByTaskId).toBeNull()
      })
    })
  })
})
