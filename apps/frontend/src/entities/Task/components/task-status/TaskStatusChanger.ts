import { ITaskStatus } from '@/entities/Project'
import { TaskStatusCodeDefault } from '@/entities/Project/model/types/project.interface'
import { Task, TaskStore } from '@/entities/Task'

export class TaskStatusChanger {
  constructor(
    private readonly _task: Task,
    private readonly _taskStore: TaskStore
  ) {}

  public change(taskStatus: ITaskStatus) {
    const statusHandlers = {
      [TaskStatusCodeDefault.open]: () => {
        !!this._task.dateFinished && this._taskStore.processed(this._task)
        this._taskStore.updateStatus(this._task, taskStatus)
      },

      [TaskStatusCodeDefault.process]: () => {
        this._taskStore.processed(this._task, taskStatus)
      },

      [TaskStatusCodeDefault.executed]: () => {
        !this._task.executor &&
          this._taskStore.assignUser([this._task, this._task.assigner])
        this._taskStore.finish({ finishedAt: new Date() }, this._task)
      },

      default: () => {
        !!this._task.dateFinished && this._taskStore.processed(this._task)
        this._taskStore.updateStatus(this._task, taskStatus)
      }
    }

    const handleStatus = statusHandlers[taskStatus.code ?? 'default']
    handleStatus()
  }
}
