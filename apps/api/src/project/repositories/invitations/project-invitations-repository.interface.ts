import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { ProjectInvitationsModel } from '../../models/project-invitations.model'
import { ProjectModel } from '../../models/project.model'
import { TransactionOrKnex } from 'objection'
import { UserModel } from '../../../user/models/user.model'
import { UUID } from 'crypto'
import { ProjectRoleType } from '../../components/permissions/types/roles/project-role.interface'

export const PROJECT_INVITATIONS_REPOSITORY = 'project_invitations_repository'

export interface IProjectInvitationsRepository extends RepositoryContract<ProjectInvitationsModel> {
  query<R = ProjectInvitationsModel>(): CustomQueryBuilder<ProjectInvitationsModel, R>

  getInvitees(project: ProjectModel): Promise<ProjectInvitationsModel[]>

  getInvitationByInviteeEmail(email: string, projectId: number): Promise<ProjectInvitationsModel>

  inviteUser(
    project: ProjectModel,
    email: string,
    sender: UserModel,
    role: ProjectRoleType,
    trx?: TransactionOrKnex
  ): Promise<ProjectInvitationsModel>

  removeInvitation(id: number, trx?: TransactionOrKnex): Promise<any>

  getInvitationByToken(token: UUID): Promise<ProjectInvitationsModel>
}
