import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { WorkspaceInvitationsModel } from '../../models/workspace-invitations.model'
import { WorkspaceModel } from '../../models/workspace.model'
import { UserModel } from '../../../user/models/user.model'
import { TransactionOrKnex } from 'objection'

export const WORKSPACE_INVITATIONS_REPOSITORY = 'workspace_invitations_repository'

export interface IWorkspaceInvitationsRepository
  extends RepositoryContract<WorkspaceInvitationsModel> {
  query<R = WorkspaceInvitationsModel>(): CustomQueryBuilder<WorkspaceInvitationsModel, R>

  inviteAdmin(
    workspace: WorkspaceModel,
    email: string,
    sender: UserModel,
    trx?: TransactionOrKnex
  ): Promise<WorkspaceInvitationsModel>

  getInvitationByToken(token: string): Promise<WorkspaceInvitationsModel>

  getInvitationByInviteeEmail(
    email: string,
    workspaceId: number
  ): Promise<WorkspaceInvitationsModel>

  getInvitees(workspaceId: number): Promise<WorkspaceInvitationsModel[]>

  removeInvitation(id: number, trx?: TransactionOrKnex): Promise<void>
}
