import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { WorkspaceInvitationsModel } from '../../models/workspace-invitations.model'
import { IWorkspaceInvitationsRepository } from './workspace-invitations-repository.interface'
import { WorkspaceModel } from '../../models/workspace.model'
import { UserModel } from '../../../user/models/user.model'
import { TransactionOrKnex } from 'objection'

@Injectable()
export class WorkspaceInvitationsRepository
  extends Repository<WorkspaceInvitationsModel>
  implements IWorkspaceInvitationsRepository
{
  @InjectModel(WorkspaceInvitationsModel)
  model: WorkspaceInvitationsModel

  public async inviteAdmin(
    workspace: WorkspaceModel,
    email: string,
    sender: UserModel,
    trx?: TransactionOrKnex
  ): Promise<WorkspaceInvitationsModel> {
    return WorkspaceInvitationsModel.query(trx)
      .insert({
        email: email,
        senderId: sender.id,
        workspaceId: workspace.id
      })
      .withGraphFetched('[sender]')
  }

  public async getInvitationByToken(token: string): Promise<WorkspaceInvitationsModel> {
    return WorkspaceInvitationsModel.query().findOne('token', token).withGraphFetched('[sender]')
  }

  public async getInvitationByInviteeEmail(
    email: string,
    workspaceId: number
  ): Promise<WorkspaceInvitationsModel> {
    return WorkspaceInvitationsModel.query()
      .where('email', email)
      .andWhere('workspaceId', workspaceId)
      .first()
  }

  public async getInvitees(workspaceId: number): Promise<WorkspaceInvitationsModel[]> {
    return WorkspaceInvitationsModel.query().where('workspaceId', workspaceId)
  }

  public async removeInvitation(id: number, trx?: TransactionOrKnex): Promise<void> {
    await WorkspaceInvitationsModel.query(trx).findOne({ id: id }).delete()
  }
}
