import dayjs from 'dayjs'
import { makeAutoObservable, runInAction } from 'mobx'
import { ProjectStore } from '@/entities/Project'
import { Sprint } from '@/entities/Sprint/model/sprint'
import { ISprintCreateDTO, ISprintDTO, ISprintUpdateDTO, SprintStatuses } from '@/entities/Sprint/model/types/sprint.types'
import { SprintsService } from '@/entities/Sprint/services/sprint.service'
import { TaskStore } from '@/entities/Task'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'

export class SprintStore {
  private _loading: boolean = true
  private _sprints: Sprint[] = []
  private _activeSprints: Sprint[] = []
  private _futureSprints: Sprint[] = []
  private _completedSprints: Sprint[] = []
  private _mapSprints: Map<number, Sprint> = new Map<number, Sprint>()
  private readonly _projectStore: ProjectStore
  private readonly _taskStore: TaskStore

  constructor(projectStore: ProjectStore, taskStore: TaskStore) {
    makeAutoObservable(this)

    this._projectStore = projectStore
    this._taskStore = taskStore
  }

  get loading(): boolean {
    return this._loading
  }

  set loading(value: boolean) {
    this._loading = value
  }

  get sprints(): Sprint[] {
    return this._sprints
  }

  get activeSprints(): Sprint[] {
    return this._activeSprints
  }

  get futureSprints(): Sprint[] {
    return this._futureSprints
  }

  get completedSprints(): Sprint[] {
    return this._completedSprints
  }

  public async init(): Promise<void> {
    if (!this._projectStore.projects.length) {
      return
    }

    runInAction(() => {
      this._loading = true
    })

    this.clear()
    await this.mapSprints()

    runInAction(() => {
      this._loading = false
    })
  }

  private mapSprint(dto: ISprintDTO): Sprint {
    if (this._mapSprints.has(dto.id)) {
      return this._mapSprints.get(dto.id)!
    }

    const sprint = new Sprint(dto, this._taskStore, this._projectStore)
    if (sprint.status === SprintStatuses.Active) {
      this._activeSprints.push(sprint)
    }

    if (sprint.status === SprintStatuses.Planned) {
      this._futureSprints.push(sprint)
    }

    if (sprint.status === SprintStatuses.Completed) {
      this._completedSprints.push(sprint)
    }

    this._mapSprints.set(dto.id, sprint)
    return sprint
  }

  private async mapSprints() {
    const dtos = await this.fetchSprints()

    const sprints = dtos.map((dto) => this.mapSprint(dto))

    runInAction(() => {
      this._sprints = sprints
    })
  }

  private async fetchSprints(): Promise<ISprintDTO[]> {
    return SprintsService.getProjectSprings(this._projectStore.activeProject.id)
  }

  public get(id: number): Sprint {
    const sprint = this._mapSprints.get(id)

    if (!sprint) {
      throw new Error(`Can't find sprint with id: ${id}`)
    }

    return sprint
  }

  public find(id: unknown): Sprint | null {
    if (typeof id !== 'number') {
      return null
    }

    const sprint = this._mapSprints.get(id)

    return sprint ?? null
  }

  private getStatus(dto: { dateStart?: Date; dateEnd?: Date }): SprintStatuses {
    const now = dayjs().utc().toDate()
    const start = dto.dateStart ? new Date(dto.dateStart) : null
    const end = dto.dateEnd ? new Date(dto.dateEnd) : null

    if (start && start > now) {
      return SprintStatuses.Planned
    }
    if (end && end < now) {
      return SprintStatuses.Completed
    }
    return SprintStatuses.Active
  }

  private updateStatus(sprint: Sprint, newStatus: SprintStatuses) {
    const previousStatus = sprint.status
    if (previousStatus === newStatus) return

    if (previousStatus === SprintStatuses.Active) {
      this._activeSprints = this._activeSprints.filter(
        (s) => s.id !== sprint.id
      )
    }

    if (previousStatus === SprintStatuses.Completed) {
      this._completedSprints = this._completedSprints.filter(
        (s) => s.id !== sprint.id
      )
    }
    if (previousStatus === SprintStatuses.Planned) {
      this._futureSprints = this._futureSprints.filter(
        (s) => s.id !== sprint.id
      )
    }

    if (newStatus === SprintStatuses.Active) {
      this._activeSprints.push(sprint)
    }

    if (newStatus === SprintStatuses.Completed) {
      this._completedSprints.push(sprint)
    }
    if (newStatus === SprintStatuses.Planned) {
      this._futureSprints.push(sprint)
    }

    sprint.status = newStatus
  }

  public create(id: number, status: SprintStatuses, dto: ISprintCreateDTO) {
    if (!id) {
      throw new Error('Can not get sprint id from server')
    }
    const user = LocalStorageHelper.getUser()

    const sprint = new Sprint(
      {
        id: id,
        title: dto.title,
        description: dto.description,
        dateEnd: dto.dateEnd,
        dateStart: dto.dateStart,
        user: user,
        projectId: dto.projectId ?? this._projectStore.activeProject.id,
        status: status,
        taskIds: []
      },
      this._taskStore,
      this._projectStore
    )

    this._mapSprints.set(id, sprint)

    const proxySprint = this.get(sprint.id)

    runInAction(() => {
      this._sprints = [proxySprint, ...this._sprints]

      if (status === SprintStatuses.Active) {
        this._activeSprints = [proxySprint, ...this._activeSprints]
      } else if (status === SprintStatuses.Planned) {
        this._futureSprints = [proxySprint, ...this._futureSprints]
      } else if (status === SprintStatuses.Completed) {
        this._completedSprints = [proxySprint, ...this._completedSprints]
      }
    })
  }

  public deleteSprint(id: number): void {
    const sprint = this._mapSprints.get(id)
    if (!sprint) return

    runInAction(() => {
      this._mapSprints.delete(id)
      this._sprints = this._sprints.filter((s) => s.id !== id)
      this._activeSprints = this._activeSprints.filter((s) => s.id !== id)
      this._futureSprints = this._futureSprints.filter((s) => s.id !== id)
      this._completedSprints = this._completedSprints.filter((s) => s.id !== id)
    })
  }

  public updateSprint(id: number, updates: Partial<ISprintUpdateDTO>): void {
    runInAction(() => {
      const sprint = this._mapSprints.get(id)

      if (!sprint) {
        throw new Error(`Спринт с id ${id} не найден`)
      }

      if (updates.title !== undefined) {
        sprint.title = updates.title
      }

      if (updates.description !== undefined) {
        sprint.description = updates.description
      }

      if (updates.dateStart !== undefined) {
        sprint.dateStart = updates.dateStart
      }

      if (updates.dateEnd !== undefined) {
        sprint.dateEnd = updates.dateEnd
      }

      if (updates.dateStart !== undefined || updates.dateEnd !== undefined) {
        const newStatus = this.getStatus({
          dateStart: sprint.dateStart,
          dateEnd: sprint.dateEnd
        })

        this.updateStatus(sprint, newStatus)
      }
    })
  }

  public removeTasksFromSprint(sprintId: number, taskIds: number[]): void {
    const sprint = this._mapSprints.get(sprintId)
    if (!sprint) {
      console.error(`Sprint with ID ${sprintId} not found`)
      return
    }

    sprint.tasks = sprint.tasks.filter((task) => !taskIds.includes(task.id))
  }

  public addTasksToSprint(sprintId: number, taskIds: number[]): void {
    const sprint = this._mapSprints.get(sprintId)
    if (!sprint) {
      console.error(`Sprint with ID ${sprintId} not found`)
      return
    }

    const tasks = taskIds.map((taskId) => {
      return this._taskStore.get(taskId)
    })

    sprint.tasks = [...sprint.tasks, ...tasks]
  }

  public isTitleExists = (title: string): boolean => {
    return this._sprints.some((sprint) => sprint.title === title)
  }

  public clear() {
    runInAction(() => {
      this._sprints = []
      this._activeSprints = []
      this._futureSprints = []
      this._completedSprints = []
      this._mapSprints.clear()
    })
  }
}