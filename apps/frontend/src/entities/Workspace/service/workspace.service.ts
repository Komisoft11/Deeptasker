import { IUser } from '@/entities/User'
import {
  IPermissionWorkspace,
  IWorkspaceCreateDto,
  IWorkspaceDTO,
  IWorkspaceInviteAdminDTO,
  IWorkspaceRemoveMemberDTO,
  IWorkspaceUpdateByFieldsDto,
  IWorkspaceUpdateDto,
  Workspace
} from '@/entities/Workspace'
import {
  AdminInviteesDTO,
  IAcceptInvite
} from '@/entities/Workspace/model/types/workspace.interface'
import axios from '@/shared/api/interceptors'
import { ICreatedRecord } from '@/shared/types/created-record.interface'

const getWorkspaceUrl = (string: string = '') => `/workspaces${string}`

export const WorkspaceService = {
  async create(dto: IWorkspaceCreateDto): Promise<ICreatedRecord> {
    return (await axios.post(getWorkspaceUrl(), dto)).data
  },

  async update(dto: IWorkspaceUpdateDto): Promise<void> {
    return (await axios.patch(getWorkspaceUrl(`/${dto.id}`), dto)).data
  },

  async delete(workspace: Workspace): Promise<void> {
    return (await axios.delete(getWorkspaceUrl(`/${workspace.id}`))).data
  },

  async getAll(): Promise<IWorkspaceDTO[]> {
    return (await axios.get<IWorkspaceDTO[]>(getWorkspaceUrl())).data
  },

  async getAdmins(workspace: Workspace): Promise<IUser[]> {
    return (
      await axios.get<IUser[]>(getWorkspaceUrl(`/${workspace.id}/admins`))
    ).data
  },

  async getInvitees(workspace: Workspace): Promise<AdminInviteesDTO[]> {
    return (
      await axios.get<AdminInviteesDTO[]>(
        getWorkspaceUrl(`/${workspace.id}/invitees`)
      )
    ).data
  },

  async removeMember({
    memberId,
    workspace
  }: IWorkspaceRemoveMemberDTO): Promise<void> {
    return (
      await axios.delete(getWorkspaceUrl(`/${workspace.id}/user/${memberId}`))
    ).data
  },

  async updateWorkspaceByFields(
    dto: IWorkspaceUpdateByFieldsDto
  ): Promise<Workspace> {
    const url = `/${dto.id}?fields=` + dto.fields.join(',')
    return (await axios.get<Workspace>(getWorkspaceUrl(url))).data
  },

  async inviteAdmin({
    workspace,
    email
  }: IWorkspaceInviteAdminDTO): Promise<void> {
    return (
      await axios.post<void>(getWorkspaceUrl(`/${workspace.id}/user`), {
        email: email
      })
    ).data
  },

  async cancelAdmin({
    workspace,
    email
  }: IWorkspaceInviteAdminDTO): Promise<void> {
    return (
      await axios.post<void>(getWorkspaceUrl(`/${workspace.id}/user/cancel`), {
        email: email
      })
    ).data
  },

  async changePermissions(
    workspace: Workspace,
    user: IUser,
    permissions: IPermissionWorkspace
  ): Promise<void> {
    return (
      await axios.patch<void>(
        getWorkspaceUrl(`/${workspace.id}/user/${user.id}`),
        permissions
      )
    ).data
  },

  async acceptInvitation(workspaceId: number): Promise<IAcceptInvite> {
    return (
      await axios.get<IAcceptInvite>(
        getWorkspaceUrl(`/authenticated-accept-invitation/${workspaceId}`)
      )
    ).data
  },

  async declineInvitation(workspaceId: number): Promise<void> {
    return (
      await axios.get(
        getWorkspaceUrl(`/authenticated-decline-invitation/${workspaceId}`)
      )
    ).data
  }
}