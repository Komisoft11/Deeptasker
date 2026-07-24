import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { ProjectInvitationsModel } from '../../models/project-invitations.model'
import { IProjectInvitationsRepository } from './project-invitations-repository.interface'
import { ProjectModel } from '../../models/project.model'
import { UserModel } from '../../../user/models/user.model'
import { TransactionOrKnex } from 'objection'
import { UUID } from 'crypto'
import { ProjectRoleType } from '../../components/permissions/types/roles/project-role.interface'

@Injectable()
export class ProjectInvitationsRepository
  extends Repository<ProjectInvitationsModel>
  implements IProjectInvitationsRepository
{
  @InjectModel(ProjectInvitationsModel)
  model: ProjectInvitationsModel

  public async getInvitees(project: ProjectModel): Promise<ProjectInvitationsModel[]> {
    return ProjectInvitationsModel.query().where('projectId', project.id)
  }

  public async getInvitationByInviteeEmail(
    email: string,
    projectId: number
  ): Promise<ProjectInvitationsModel> {
    return ProjectInvitationsModel.query()
      .where('email', email)
      .andWhere('projectId', projectId)
      .first()
  }

  public async inviteUser(
    project: ProjectModel,
    email: string,
    sender: UserModel,
    role: ProjectRoleType,
    trx?: TransactionOrKnex
  ): Promise<ProjectInvitationsModel> {
    return ProjectInvitationsModel.query(trx)
      .insert({
        email: email,
        senderId: sender.id,
        projectId: project.id,
        role: role
      })
      .withGraphFetched('[sender]')
  }

  public async removeInvitation(id: number, trx?: TransactionOrKnex): Promise<void> {
    await ProjectInvitationsModel.query(trx).findOne({ id: id }).delete()
  }

  public async getInvitationByToken(token: UUID): Promise<ProjectInvitationsModel> {
    return ProjectInvitationsModel.query().findOne('token', token).withGraphFetched('[sender]')
  }
}
