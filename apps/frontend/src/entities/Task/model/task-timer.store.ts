import { makeAutoObservable, runInAction } from 'mobx'
import { Task, TaskStore } from '@/entities/Task'
import { formatTaskTrackerTime } from '@/shared/helpers/dates/formatTaskTrackerTime'
import { secondsBetween } from '@/shared/helpers/dates/timeBetween'
import { isEmpty } from '@/shared/lib/helpers/main.helper'
import { Timeout } from '@/shared/types/time.interface'

export class TaskTimerStore {
  private _isRunning: boolean = false
  private _seconds: number = 0
  private _timer: Timeout | null = null
  private readonly taskStore: TaskStore

  constructor(taskStore: TaskStore) {
    this.taskStore = taskStore
    makeAutoObservable(this)
  }

  public getTimerStingByTask(task: Task): string {
    if (task.id === this.taskStore.trackingTask.id) {
      return formatTaskTrackerTime(this._seconds)
    }

    return formatTaskTrackerTime(this.initTimer(task))
  }

  public isCurrentTaskRunning(task: Task): boolean {
    return this._isRunning && task.id === this.taskStore.trackingTask?.id
  }

  public isOtherTaskRunning(task: Task): boolean {
    return this._isRunning && task.id !== this.taskStore.trackingTask?.id
  }

  async init(): Promise<void> {
    if (!isEmpty(this.taskStore.trackingTask) && !this._isRunning) {
      this.startTimer()
    }
  }

  public initTimer(task: Task): number {
    return task.userSecondsTracked ?? 0
  }

  public start(task: Task, startedAt: Date) {
    if (!this._timer) {
      this.taskStore.startTrackingTask(task, startedAt)
      this.startTimer()
    }
  }

  public stop(task: Task, stoppedAt: Date) {
    if (this._timer) {
      clearInterval(this._timer)

      this._timer = null
      runInAction(() => {
        this._isRunning = false
        this._seconds =
          task.userSecondsTracked + secondsBetween(task.activeDate, stoppedAt)
        this.taskStore.stopTrackingTask(this._seconds)
      })
    }
  }

  private startTimer() {
    const { trackingTask } = this.taskStore
    runInAction(() => {
      this._seconds = this.initTimer(trackingTask)
    })

    this._timer = setInterval(() => {
      this._seconds++
    }, 1000)

    runInAction(() => {
      this._isRunning = true
    })
  }

  clear() {
    this._isRunning = false
    this._seconds = 0
    this._timer = null
  }
}
