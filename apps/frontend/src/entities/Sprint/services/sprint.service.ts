import {
  ISprintCreateDTO,
  ISprintDTO,
  ISprintRecord,
  ISprintUpdateDTO
} from '@/entities/Sprint/model/types/sprint.types'
import axios from '@/shared/api/interceptors'

const getSprintUrl = (workspaceId: number, projectId: number) =>
  `/workspaces/${workspaceId}/projects/${projectId}/sprints`

const sprintUrl = (string?: string) => `/sprints${string}`

export const SprintsService = {
  workspaceId: 0,
  setWorkspaceId(workspaceId: number) {
    this.workspaceId = workspaceId
  },

  async getProjectSprings(projectId: number): Promise<ISprintDTO[]> {
    return (await axios.get(getSprintUrl(this.workspaceId, projectId))).data
  },

  async addSprint(dto: ISprintCreateDTO): Promise<ISprintRecord> {
    return (await axios.post(sprintUrl(''), dto)).data
  },

  async deleteSprint({ id }: { id: number }): Promise<void> {
    return (await axios.delete(sprintUrl(`/${id}`))).data
  },

  async updateSprint({
    id,
    updates
  }: {
    id: number
    updates: ISprintUpdateDTO
  }): Promise<void> {
    return (await axios.patch(sprintUrl(`/${id}`), updates)).data
  },

  async removeTaskFromSprint({
    id,
    taskIds
  }: {
    id: number
    taskIds: number[]
  }): Promise<void> {
    return (await axios.patch(sprintUrl(`/${id}/remove/tasks`), { taskIds }))
      .data
  },

  async addTasksToSprint({
    id,
    taskIds
  }: {
    id: number
    taskIds: number[]
  }): Promise<void> {
    return (await axios.patch(sprintUrl(`/${id}/add/tasks`), { taskIds })).data
  }
}
