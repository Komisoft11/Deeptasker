import { IFolderDTO } from '@/entities/Folder/model/types/folder.interface'
import {
  ICreateDuplicateStatusDTO,
  ICreateProjectDTO,
  IProjectUpdateDto,
  ITag,
  ITagCreateDto,
  ITaskStatus,
  ITaskStatusCreateDto,
  ITaskStatusUpdateDto,
  Project
} from '@/entities/Project'
import {
  IAcceptInvite,
  IDeleteTaskStatusDto,
  IDuplicateStatusDTO,
  IProjectDto,
  IProjectInviteMemberOrCancelInvite,
  IProjectInviteMultipleMembers,
  IProjectInviteesDTO,
  IProjectPermissionRole,
  IProjectRemoveMember
} from '@/entities/Project/model/types/project.interface'
import { IProjectReport, IProjectReportDTO } from '@/entities/Report'
import { TaskResponse } from '@/entities/Task'
import { IUser } from '@/entities/User'
import axios from '@/shared/api/interceptors'
import { ICreatedRecord } from '@/shared/types/created-record.interface'

const getProjectUrl = (workspaceId: number, string: string = ''): string =>
  `/workspaces/${workspaceId}/projects${string}`

const getProjectWithoutWorkspaceUrl = (
  projectId?: number,
  string: string = ''
): string => `/projects/${projectId}${string}`

const getReportUrl = (projectId: number, string: string) =>
  `/report/project/${projectId}/${string}`

export const ProjectService = {
  async create(project: ICreateProjectDTO): Promise<IProjectDto> {
    return (await axios.post(getProjectUrl(project.workspaceId), project)).data
  },

  async update(
    workspaceId: number,
    dto: Partial<IProjectUpdateDto>
  ): Promise<void> {
    const { id, ...values } = dto
    return (await axios.patch(getProjectUrl(workspaceId, `/${dto.id}`), values))
      .data
  },

  async delete(project: Project): Promise<void> {
    return (
      await axios.delete(getProjectUrl(project.workspace.id, `/${project.id}`))
    ).data
  },

  async getTasksByProject(
    project: Project,
    signal?: AbortSignal
  ): Promise<TaskResponse[]> {
    return (
      await axios.get<TaskResponse[]>(
        getProjectUrl(project.workspace.id, `/${project.id}/tasks`),
        {
          signal
        }
      )
    ).data
  },

  async getReportsByProject(project: Project): Promise<IProjectReport[]> {
    return (
      await axios.get(
        getProjectUrl(project.workspace.id, `/${project.id}/reports`)
      )
    ).data
  },

  async createReport(
    dto: IProjectReportDTO,
    projectId: number
  ): Promise<ICreatedRecord> {
    return (await axios.post(getReportUrl(projectId, 'task-execution'), dto))
      .data
  },

  async deleteReport(reportUUID: string, projectId: number): Promise<void> {
    return (await axios.delete(getReportUrl(projectId, `${reportUUID}`))).data
  },

  async getFoldersByProject(project: Project): Promise<IFolderDTO[]> {
    return (
      await axios.get<IFolderDTO[]>(
        getProjectUrl(project.workspace.id, `/${project.id}/folders`)
      )
    ).data
  },

  async inviteMember({
    email,
    project
  }: IProjectInviteMemberOrCancelInvite): Promise<void> {
    return (
      await axios.post<void>(
        getProjectUrl(project.workspace.id, `/${project.id}/user`),
        {
          email: email
        }
      )
    ).data
  },

  async cancelInviteMember({
    email,
    project
  }: IProjectInviteMemberOrCancelInvite): Promise<void> {
    return (
      await axios.post<void>(
        getProjectUrl(project.workspace.id, `/${project.id}/user/cancel`),
        {
          email: email
        }
      )
    ).data
  },

  async inviteMultipleMembers({
    project,
    invitees
  }: IProjectInviteMultipleMembers): Promise<void> {
    return (
      await axios.post<void>(
        getProjectUrl(project.workspace.id, `/${project.id}/users`),
        {
          invitees
        }
      )
    ).data
  },

  async changePermissions(
    user: IUser,
    project: Project,
    projectPermissions: IProjectPermissionRole
  ): Promise<void> {
    return (
      await axios.patch<void>(
        getProjectUrl(
          project.workspace.id,
          `/${project.id}/permissions/${user.id}`
        ),
        {
          role: projectPermissions.role,
          permissions: projectPermissions.permissions
        }
      )
    ).data
  },

  async removeMember({ member, project }: IProjectRemoveMember): Promise<void> {
    return (
      await axios.delete<void>(
        getProjectUrl(project.workspace.id, `/${project.id}/user/${member.id}`)
      )
    ).data
  },

  async getProject(
    projectId: number,
    workspaceId: number
  ): Promise<IProjectDto> {
    return (
      await axios.get<IProjectDto>(getProjectUrl(workspaceId, `/${projectId}`))
    ).data
  },

  async deleteTag(projectId: number, tagId: number): Promise<void> {
    return (
      await axios.delete(
        getProjectWithoutWorkspaceUrl(projectId, `/tags/${tagId}`)
      )
    ).data
  },

  async createTag(dto: ITagCreateDto): Promise<ITag> {
    return (
      await axios.post<ITag>(
        getProjectWithoutWorkspaceUrl(dto.projectId, '/tags'),
        {
          name: dto.name,
          color: dto.colorBg
        }
      )
    ).data
  },

  async changeTag(projectId: number, tagId: number, dto: ITag): Promise<ITag> {
    return (
      await axios.patch<ITag>(
        getProjectWithoutWorkspaceUrl(projectId, `/tags/${tagId}`),
        {
          name: dto.name,
          color: dto.colorBg
        }
      )
    ).data
  },

  async getAll(workspaceId: number): Promise<IProjectDto[]> {
    return (await axios.get<IProjectDto[]>(getProjectUrl(workspaceId))).data
  },

  async createTaskStatus(
    project: Project,
    dto: ITaskStatusCreateDto
  ): Promise<ITaskStatus> {
    return (
      await axios.post<ITaskStatus>(
        getProjectUrl(project.workspace.id, `/${project.id}/status`),
        dto
      )
    ).data
  },

  async deleteTaskStatus(dto: IDeleteTaskStatusDto): Promise<void> {
    return (
      await axios.delete(
        getProjectUrl(
          dto.project.workspace.id,
          `/${dto.project.id}/status/${dto.status.id}`
        )
      )
    ).data
  },

  async updateTaskStatus(
    project: Project,
    dto: ITaskStatusUpdateDto
  ): Promise<ITaskStatus> {
    return (
      await axios.patch<ITaskStatus>(
        getProjectUrl(project.workspace.id, `/${project.id}/status/${dto.id}`),
        dto
      )
    ).data
  },

  async duplicateStatus({
    project,
    status
  }: ICreateDuplicateStatusDTO): Promise<IDuplicateStatusDTO> {
    return (
      await axios.post<IDuplicateStatusDTO>(
        getProjectUrl(project.workspace.id, `/${project.id}/status/duplicate`),
        { statusId: status.id }
      )
    ).data
  },

  async getMembers(project: Project, workspaceId: number): Promise<IUser[]> {
    return (
      await axios.get(getProjectUrl(workspaceId, `/${project.id}/members`))
    ).data
  },

  async getInvitees(
    project: Project,
    workspaceId: number
  ): Promise<IProjectInviteesDTO[]> {
    return (
      await axios.get<IProjectInviteesDTO[]>(
        getProjectUrl(workspaceId, `/${project.id}/invitees`)
      )
    ).data
  },

  async archive(project: Project): Promise<void> {
    return (
      await axios.post(
        getProjectUrl(project.workspace.id, `/archive/${project.id}`)
      )
    ).data
  },

  async acceptInvitation(
    projectId: number,
    workspaceId: number
  ): Promise<IAcceptInvite> {
    return (
      await axios.get<IAcceptInvite>(
        getProjectUrl(
          workspaceId,
          `/authenticated-accept-invitation/${projectId}`
        )
      )
    ).data
  },

  async declineInvitation(
    projectId: number,
    workspaceId: number
  ): Promise<void> {
    return (
      await axios.get(
        getProjectUrl(
          workspaceId,
          `/authenticated-decline-invitation/${projectId}`
        )
      )
    ).data
  }
}
