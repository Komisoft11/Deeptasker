import { ITag } from '@/entities/Project'
import {
  AddTimeHistoryRequest,
  AssignObserverRequest,
  AssignUserRequest,
  AutoCompleteRequest,
  BindTaskRequest,
  ExtendedTaskResponse,
  FinishTaskResponse,
  MoveTaskRequest,
  MoveTasksToNewStatusRequest,
  MoveTasksToNewStatusResponse,
  ReassignUserResponse,
  StartTaskResponse,
  StopTaskResponse,
  TagRequest,
  Task,
  TaskChangeFolderRequest,
  TaskChangeProjectRequest,
  TaskCreateRequest,
  TaskStore,
  TaskUpdateFieldsRequest,
  TimerHistoryRequest,
  TrackingTaskResponse
} from '@/entities/Task'
import { TaskTimerHistoryResponse } from '@/entities/Task/model/types/task-response.interface'
import axios from '@/shared/api/interceptors'
import { ICreatedRecord } from '@/shared/types/created-record.interface'

const getTasksUrl = (string: string) => `/tasks${string}`
export const TaskService = {
  async getExtendedTaskDTOByExternalId(
    workspaceId: number,
    projectSlug: string,
    externalId: string
  ): Promise<ExtendedTaskResponse> {
    return (
      await axios.get<ExtendedTaskResponse>(
        getTasksUrl(
          `/workspace/${workspaceId}/slug/${projectSlug}/external/${externalId}`
        )
      )
    ).data
  },

  async getTrackingTask(): Promise<TrackingTaskResponse | void> {
    return (
      await axios.get<TrackingTaskResponse | void>(getTasksUrl(`/trackingTask`))
    ).data
  },

  async create(taskCreateDto: TaskCreateRequest): Promise<ICreatedRecord> {
    return (await axios.post<ICreatedRecord>(getTasksUrl(''), taskCreateDto))
      .data
  },

  async update(taskUpdateFields: TaskUpdateFieldsRequest): Promise<void> {
    return (
      await axios.patch(
        getTasksUrl(`/${taskUpdateFields.id}`),
        taskUpdateFields.dto
      )
    ).data
  },

  async reassignUser(task: Task): Promise<ReassignUserResponse> {
    return (await axios.patch(getTasksUrl(`/${task.id}/assign`))).data
  },

  async assignUser([task, user]: AssignUserRequest): Promise<void> {
    return (await axios.post(getTasksUrl(`/${task.id}/assign/${user.id}`))).data
  },

  async changeAssigner([task, user]: AssignUserRequest): Promise<void> {
    return (await axios.patch(getTasksUrl(`/${task.id}/assigner/${user.id}`)))
      .data
  },

  async assignObserver([task, user]: AssignObserverRequest): Promise<void> {
    const data = {
      code: 'observer'
    }
    return (
      await axios.post(getTasksUrl(`/${task.id}/access/give/${user.id}`), data)
    ).data
  },

  async reassignObserver([task, user]: AssignObserverRequest): Promise<void> {
    const data = {
      code: 'observer'
    }
    return (
      await axios.post(getTasksUrl(`/${task.id}/access/take/${user.id}`), data)
    ).data
  },

  async delete(task: Task): Promise<void> {
    return (await axios.delete(getTasksUrl(`/${task.id}`))).data
  },

  async backToWork(task: Task): Promise<void> {
    return (await axios.post(getTasksUrl(`/${task.id}/return`))).data
  },

  async finish(task: Task): Promise<FinishTaskResponse> {
    return await axios.post(getTasksUrl(`/${task.id}/finish`))
  },

  async autocomplete(autocomplete: AutoCompleteRequest): Promise<Task[]> {
    return (await axios.post(getTasksUrl('/autocomplete'), autocomplete)).data
  },

  async bind(bindTask: BindTaskRequest): Promise<void> {
    return (
      await axios.post(getTasksUrl(`/${bindTask.taskId}/bind`), {
        newParentId: bindTask.parentId
      })
    ).data
  },

  async move(moveTask: MoveTaskRequest): Promise<void> {
    return (
      await axios.post(getTasksUrl(`/${moveTask.taskId}/move`), {
        parentId: moveTask.taskFromId,
        newParentId: moveTask.taskToId,
        customOrder: moveTask.order
      })
    ).data
  },

  async startTimer(task: Task): Promise<StartTaskResponse> {
    return (await axios.post(getTasksUrl(`/${task.id}/timer/start`))).data
  },

  async stopTimer(task: Task): Promise<StopTaskResponse> {
    return (await axios.post(getTasksUrl(`/${task.id}/timer/stop`))).data
  },

  getCountExecuteSubtask(task: Task): number {
    let count = 0
    if (task.subtasks.length === 0) {
      return count
    }
    task.subtasks.forEach((subtask) => {
      if (!!subtask.dateFinished || !!subtask.finishedByTaskId) {
        count++
      }
    })
    return count
  },

  getSubtaskIds(task: Task, taskStore: TaskStore): number[] {
    let ids: number[] = []
    for (const subtask of task.subtasks) {
      ids.push(subtask.id)
      if (subtask.subtasks.length !== 0) {
        ids.push(...this.getSubtaskIds(subtask, taskStore))
      }
    }

    return ids
  },

  async deleteTag(task: Task, tag: ITag) {
    return (await axios.delete(getTasksUrl(`/${task.id}/tag/${tag.id}`))).data
  },

  async addTag({ task, tag }: TagRequest) {
    return (await axios.post(getTasksUrl(`/${task.id}/tag/${tag.id}`))).data
  },

  async changeProject(dto: TaskChangeProjectRequest): Promise<void> {
    return (
      await axios.post(
        getTasksUrl(`/${dto.task.id}/change-project/${dto.changedProject.id}`)
      )
    ).data
  },

  async changeFolder(dto: TaskChangeFolderRequest): Promise<void> {
    return (
      await axios.post(
        getTasksUrl(`/${dto.taskId}/change-folder/${dto.folderId}`)
      )
    ).data
  },

  async removeFolder(taskId: number): Promise<void> {
    return (await axios.post(getTasksUrl(`/${taskId}/remove-folder`))).data
  },

  async generateTitle(title: string): Promise<string> {
    return (
      await axios.post<string>(getTasksUrl('/generate-title'), {
        content: title
      })
    ).data
  },

  async sentForReview(task: Task): Promise<void> {
    return (await axios.post(getTasksUrl(`/${task.id}/sent-for-review`))).data
  },

  async cancelTaskReview(task: Task): Promise<void> {
    return (await axios.post(getTasksUrl(`/${task.id}/cancel-review`))).data
  },

  async confirm(task: Task): Promise<void> {
    return (await axios.post(getTasksUrl(`/${task.id}/confirm`))).data
  },

  async getTimeHistory(task: Task): Promise<TaskTimerHistoryResponse[]> {
    return (await axios.get<any>(getTasksUrl(`/${task.id}/timer/history`))).data
  },

  async addTimeHistory(
    task: Task,
    dto: AddTimeHistoryRequest
  ): Promise<{ id: number }> {
    return (
      await axios.post(getTasksUrl(`/${task.id}/timer/history`), {
        comment: dto.comment,
        endTime: dto.endTime,
        startTime: dto.startTime
      })
    ).data
  },

  async changeTimerHistory(
    task: Task,
    historyId: number,
    timerUpdatedFields: TimerHistoryRequest
  ): Promise<TaskTimerHistoryResponse[]> {
    return (
      await axios.patch(
        getTasksUrl(`/${task.id}/timer/history/${historyId}`),
        timerUpdatedFields
      )
    ).data
  },

  async deleteTimeHistory(dto: TaskTimerHistoryResponse) {
    return (
      await axios.delete(getTasksUrl(`/${dto.taskId}/timer/history/${dto.id}`))
    ).data
  },

  async moveTasksToNewStatus(
    dto: MoveTasksToNewStatusRequest
  ): Promise<MoveTasksToNewStatusResponse> {
    return (await axios.post(getTasksUrl('/update-status'), dto)).data
  }
}
