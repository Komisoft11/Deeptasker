import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { WorkspaceModel } from '../../models/workspace.model'
import { TransactionOrKnex } from 'objection'
import { UserModel } from '../../../user/models/user.model'
import { CreateWorkspaceDto } from '../../dto/in/create-workspace.dto'
import { I18nContext, I18nService } from 'nestjs-i18n'
import type { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { UpdateWorkspaceDto } from '../../dto/in/update-workspace.dto'
import { EventService } from '../../../events/event.service'
import { WorkspaceDto } from '../../dto/out/workspace.dto'
import { MyBaseModel } from '../../../common/database/base.model'
import { WorkspacePermissionsDto } from '../../dto/in/workspace-permissions.dto'
import { WorkspaceAuthService } from '../../auth/workspace-auth.service'
import { PlanService } from '../../../payment/services/plan.service'
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY
} from '../../repositories/workspace/workspace-repository.interface'
import {
  IWorkspaceInvitationsRepository,
  WORKSPACE_INVITATIONS_REPOSITORY
} from '../../repositories/invitations/workspace-invitations-repository.interface'
import { ConfigService } from '@nestjs/config'
import { WorkspaceInvitationsModel } from '../../models/workspace-invitations.model'
import { InviteAdminDto } from '../../dto/in/invite-admin.dto'
import { UserService } from '../../../user/user.service'
import { AdminInviteeDto } from '../../dto/out/admin-invitee.dto'
import { UserSearchDto } from '../../../user/dto/out/user-search.dto'
import { ProjectService } from '../../../project/services/project/project.service'
import { WorkspacePermissionsService } from '../permissions/workspace-permissions.service'
import { NotificationService } from '../../../notification/notification.service'
import type { Lang } from '../../../notification/types'

export type WorkspaceExtraProperties = Array<'admins' | 'user'>

type AdminInvitationLinks = { acceptLink: string; declineLink: string }

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly i18n: I18nService,
    @Inject(WORKSPACE_REPOSITORY) private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(WORKSPACE_INVITATIONS_REPOSITORY)
    private readonly workspaceInvitationsRepository: IWorkspaceInvitationsRepository,
    private readonly eventService: EventService,
    private readonly workspaceAuthService: WorkspaceAuthService,
    private readonly planService: PlanService,
    private readonly configService: ConfigService,
    private readonly projectService: ProjectService,
    private readonly workspacePermissionsService: WorkspacePermissionsService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly messagingService: NotificationService
  ) {}

  public async create(
    createWorkspaceDto: CreateWorkspaceDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<WorkspaceModel> {
    if (!(await this.planService.canCreateWorkspaces(user))) {
      throw new ForbiddenException(
        this.i18n.t('workspace.too_many_workspaces_for_current_plan', {
          lang: I18nContext.current().lang
        })
      )
    }

    const workspace = await this.workspaceRepository.createWorkspace(createWorkspaceDto, user, trx)

    await this.workspacePermissionsService.giveOwnerPermissionsToWorkspace(user, workspace, trx)

    const workspaceDto = this.mapper.map(workspace, WorkspaceModel, WorkspaceDto)

    this.eventService
      .sendEvent({
        userId: user.id,
        workspace: {
          id: workspace.id,
          create: workspaceDto
        }
      })
      .catch(e => console.error(e))

    const hasInvitees = createWorkspaceDto?.emailInvitees?.length > 0

    if (hasInvitees) {
      await Promise.all(
        createWorkspaceDto.emailInvitees.map(email => {
          this.inviteAdmin(workspace, { email: email }, user)
        })
      )
    }

    return workspace
  }

  public async createDefault(user: UserModel, trx: TransactionOrKnex): Promise<WorkspaceModel> {
    return this.create(
      { title: this.i18n.t('workspace.default_name', { lang: I18nContext.current().lang }) },
      user,
      trx
    )
  }

  public async update(
    workspace: WorkspaceModel,
    updateWorkspaceDto: UpdateWorkspaceDto,
    user: UserModel
  ): Promise<void> {
    await this.workspaceRepository.updateWorkspace(workspace, updateWorkspaceDto)

    this.eventService
      .sendEvent({
        userId: user.id,
        workspace: {
          id: workspace.id,
          update: {
            title: updateWorkspaceDto.title
          }
        }
      })
      .catch(e => console.error(e))
  }

  public async getWorkspace(
    id: number,
    fields: WorkspaceExtraProperties = []
  ): Promise<WorkspaceModel> {
    const workspace = await this.workspaceRepository.getWorkspace(id)

    await Promise.all(
      fields.map(field => {
        switch (field) {
          case 'admins':
            return this.workspaceRepository.fetchGraph(
              workspace,
              'admins(notDeleted,selectShortColor)'
            )
          case 'user':
            return this.workspaceRepository.fetchGraph(
              workspace,
              'user(notDeleted,selectShortColor)'
            )
        }
      })
    )

    if (!workspace) {
      throw new NotFoundException(this.i18n.t('workspace.not_found'))
    }
    if (workspace.user || workspace.admins?.length) {
      const admins = workspace.admins ?? []
      workspace.admins = [workspace.user, ...admins]
    }

    return workspace
  }

  public async getUserWorkspaces(user: UserModel): Promise<WorkspaceModel[]> {
    return this.workspaceRepository.getUserWorkspaces(user)
  }

  public async delete(workspace: WorkspaceModel, user: UserModel) {
    const trx = await MyBaseModel.startTransaction()

    try {
      const invitees = await this.getInvitees(workspace.id)

      if (invitees.length) {
        await Promise.all(
          invitees.map(invitee => this.cancelInviteAdmin(workspace, invitee, user, trx))
        )
      }

      const projects = await this.projectService.getProjectsByWorkspace(workspace)

      await this.workspaceRepository.deleteWorkspace(workspace, trx)

      await Promise.all([
        this.workspaceRepository.deleteWorkspace(workspace, trx),
        ...projects.map(project => this.projectService.delete(project, user))
      ])

      await trx.commit()

      this.eventService
        .sendEvent({
          userId: user.id,
          workspace: {
            id: workspace.id,
            delete: {
              dateDeleted: getCurrentUTCDateTime()
            }
          }
        })
        .then()
        .catch(e => console.error(e))
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  public async removeAdminAccess(
    workspace: WorkspaceModel,
    userToRemove: UserModel,
    user: UserModel
  ) {
    if (workspace.userId === userToRemove.id) {
      throw new BadRequestException(
        this.i18n.t('workspace.cannot_remove_owner_of_workspace', {
          lang: I18nContext.current().lang,
          args: { workspaceId: workspace.id }
        })
      )
    }

    const trx = await MyBaseModel.startTransaction()

    const projects = await this.workspaceRepository.getProjects(workspace)

    try {
      await Promise.all([
        this.workspaceRepository.removeWorkspaceUser(userToRemove.id, workspace.id, trx),
        this.workspacePermissionsService.removeAdminPermissionsToWorkspace(
          userToRemove,
          workspace,
          trx
        ),
        ...projects.map(project =>
          this.projectService.removeUserFromProject(project, userToRemove, user)
        )
      ])
      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw e
    }

    this.eventService
      .sendEvent({
        userId: user.id,
        workspace: {
          id: workspace.id,
          update: {
            admin: {
              type: 'remove',
              admin: userToRemove.getShortInfo()
            }
          }
        }
      })
      .catch(e => console.error(e))
  }

  public async updateAdminPermissions(
    workspace: WorkspaceModel,
    admin: UserModel,
    workspacePermissions: WorkspacePermissionsDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ) {
    if (workspace.userId === admin.id) {
      throw new BadRequestException(
        this.i18n.t('workspace.cannot_update_permissions_of_workspace_owner', {
          lang: I18nContext.current().lang,
          args: { adminId: admin.id }
        })
      )
    }

    if (!(await this.workspaceAuthService.isAdmin(workspace, admin))) {
      throw new BadRequestException(
        this.i18n.t('workspace.user_is_not_admin_of_workspace', {
          lang: I18nContext.current().lang,
          args: { adminId: admin.id, workspaceId: workspace.id }
        })
      )
    }

    await this.workspacePermissionsService.updateAdminPermissionsToWorkspace(
      admin,
      workspace,
      workspacePermissions,
      trx
    )

    this.eventService
      .sendEvent({
        userId: user.id,
        workspace: {
          id: workspace.id,
          update: {
            admin: {
              type: 'updatePermissions',
              admin: admin.getShortInfo(),
              permissions: workspacePermissions
            }
          }
        }
      })
      .then()
      .catch(e => console.error(e))
  }

  public async getOwnerAndAdmins(workspaceId: number): Promise<UserModel[]> {
    return this.workspaceRepository.getOwnerAndAdmins(workspaceId)
  }

  public async getInvitees(workspaceId: number): Promise<AdminInviteeDto[]> {
    return this.workspaceInvitationsRepository.getInvitees(workspaceId)
  }

  public async loadUserRoleInDTOs(
    workspaceDTOs: WorkspaceDto[],
    user: UserModel
  ): Promise<WorkspaceDto[]> {
    return Promise.all(
      workspaceDTOs.map(async dto => {
        if (await this.workspaceAuthService.isOwnerOrAdmin(dto.id, user.id)) {
          dto.userRole = 'admin'
        }
        return dto
      })
    )
  }

  public async inviteAdmin(
    workspace: WorkspaceModel,
    inviteAdminDto: InviteAdminDto,
    sender: UserModel
  ): Promise<void> {
    const invitation = await this.workspaceInvitationsRepository.getInvitationByInviteeEmail(
      inviteAdminDto.email,
      workspace.id
    )

    if (invitation) {
      throw new ForbiddenException('User is already invited to this workspace')
    }

    const isUserRegistered = await this.userService.isUserRegistered(inviteAdminDto.email)

    if (isUserRegistered) {
      const invitee = await this.userService.getUserByEmail(inviteAdminDto.email)

      if (await this.workspaceAuthService.isAdmin(workspace, invitee)) {
        throw new ForbiddenException('User is already admin of this workspace')
      }
    }

    try {
      const invitation = await this.workspaceInvitationsRepository.inviteAdmin(
        workspace,
        inviteAdminDto.email,
        sender
      )

      const links = this.generateAdminInvitationLinks(invitation)

      await this.sendInvitationInWorkspace(invitation, links, isUserRegistered)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  public async cancelInviteAdmin(
    workspace: WorkspaceModel,
    inviteAdminDto: InviteAdminDto,
    user: UserModel,
    transaction?: TransactionOrKnex
  ): Promise<void> {
    const invitation = await this.workspaceInvitationsRepository.getInvitationByInviteeEmail(
      inviteAdminDto.email,
      workspace.id
    )

    if (user.id !== invitation.senderId) {
      throw new ForbiddenException('You can not cancel this invite')
    }

    const trx = await MyBaseModel.startTransaction(transaction)

    try {
      await Promise.all([
        await this.workspaceInvitationsRepository.removeInvitation(invitation.id),
        this.notifyInvitationCanceled(workspace, invitation)
      ])
      await trx.commit()

      this.eventService
        .sendEvent({
          userId: invitation.senderId,
          workspace: {
            id: workspace.id,
            update: {
              invitee: {
                type: 'remove',
                email: invitation.email
              }
            }
          }
        })
        .then()
        .catch(e => console.error(e))
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async getInvitationByToken(token: string): Promise<WorkspaceInvitationsModel> {
    const invitation = await this.workspaceInvitationsRepository.getInvitationByToken(token)

    if (!invitation) {
      throw new NotFoundException('Invitation not found')
    }

    return invitation
  }

  public async isWorkspaceAdmin(workspace: WorkspaceModel, candidate: UserModel): Promise<boolean> {
    return this.workspaceAuthService.isAdmin(workspace, candidate)
  }

  public async declineAdminInvitation(invitation: WorkspaceInvitationsModel): Promise<string> {
    await this.validateInvitation(invitation)

    const [invitee, workspace] = await Promise.all([
      this.userService.getUserByEmail(invitation.email),
      this.getWorkspace(invitation.workspaceId)
    ])

    const trx = await MyBaseModel.startTransaction()

    try {
      const sender = await this.userService.getUser(invitation.senderId, trx)

      await this.workspaceInvitationsRepository.removeInvitation(invitation.id, trx)

      await trx.commit()

      await this.notifyInvitationDeclined(workspace, sender, invitee)

      await this.eventService.sendEvent({
        userId: invitee.id,
        workspace: {
          id: workspace.id,
          update: {
            invitee: {
              type: 'remove',
              email: invitation.email
            }
          }
        }
      })

      return this.getClientDeclinedWorkspaceUrl()
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  private async validateInvitation(invitation: WorkspaceInvitationsModel) {
    if (!this.isValidInvitation(invitation)) {
      await this.workspaceInvitationsRepository.removeInvitation(invitation.id)
      throw new ForbiddenException('Invitation not valid')
    }
  }

  public async acceptAdminInvitation(invitation: WorkspaceInvitationsModel): Promise<string> {
    await this.validateInvitation(invitation)

    const [invitee, workspace] = await Promise.all([
      this.userService.getUserByEmail(invitation.email),
      this.getWorkspace(invitation.workspaceId)
    ])

    const trx = await MyBaseModel.startTransaction()

    try {
      const sender = await this.userService.getUser(invitation.senderId, trx)
      await Promise.all([
        this.giveAdminAccess(workspace, invitee, sender, trx),
        this.notifyInvitationAccepted(workspace, sender, invitee)
      ])

      await this.workspaceInvitationsRepository.removeInvitation(invitation.id, trx)

      await trx.commit()

      await Promise.all([
        this.eventService.sendEvent({
          userId: invitee.id,
          workspace: {
            id: workspace.id,
            update: {
              admin: {
                type: 'add',
                admin: invitee
              }
            }
          }
        }),
        this.eventService.sendEvent({
          userId: invitee.id,
          workspace: {
            id: workspace.id,
            update: {
              invitee: {
                type: 'remove',
                email: invitee.email
              }
            }
          }
        })
      ])

      return this.getClientAcceptedWorkspaceUrl(workspace)
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  private async giveAdminAccess(
    workspace: WorkspaceModel,
    userToAdd: UserModel,
    user: UserModel,
    trx: TransactionOrKnex
  ) {
    if (workspace.userId === userToAdd.id) {
      throw new BadRequestException(
        this.i18n.t('workspace.user_is_owner_of_workspace', {
          lang: I18nContext.current().lang,
          args: { userId: userToAdd.id, workspaceId: workspace.id }
        })
      )
    }

    await Promise.all([
      this.workspaceRepository.createWorkspaceUser(userToAdd.id, workspace.id, trx),
      this.workspacePermissionsService.giveAdminPermissionsToWorkspace(userToAdd, workspace, trx),
      this.giveAdminPermissionsToWorkspaceProjects(userToAdd, workspace, user, trx)
    ])

    this.eventService
      .sendEvent({
        userId: user.id,
        workspace: {
          id: workspace.id,
          update: {
            admin: {
              type: 'add',
              admin: userToAdd.getShortInfo()
            }
          }
        }
      })
      .catch(e => console.error(e))
  }

  private async giveAdminPermissionsToWorkspaceProjects(
    admin: UserModel,
    workspace: WorkspaceModel,
    owner: UserModel,
    trx: TransactionOrKnex
  ) {
    const projects = await this.workspaceRepository.getProjects(workspace)

    await Promise.all(
      projects.map(project => this.projectService.removeUserFromProject(project, admin, owner))
    )

    await Promise.all(
      projects.map(project =>
        this.projectService.giveAccessToProject(project, admin.id, { role: 'admin' }, owner, trx)
      )
    )
  }

  private generateAdminInvitationLinks(
    invitation: WorkspaceInvitationsModel
  ): AdminInvitationLinks {
    const acceptLink = `${this.configService.get('SERVER_URL')}/workspaces/accept-invitation/${
      invitation.token
    }`
    const declineLink = `${this.configService.get('SERVER_URL')}/workspaces/decline-invitation/${
      invitation.token
    }`

    return { acceptLink, declineLink }
  }

  private getClientAcceptedWorkspaceUrl(workspace: WorkspaceModel): string {
    return (
      this.configService.get('CLIENT_URL') +
      `/space/${workspace.id}/workspaces/${workspace.id}/admins`
    )
  }

  private getClientDeclinedWorkspaceUrl(): string {
    return this.configService.getOrThrow<string>('CLIENT_URL')
  }

  private async notifyInvitationAccepted(
    workspace: WorkspaceModel,
    sender: UserModel,
    invitee: UserModel
  ): Promise<void> {
    await Promise.all([
      this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: invitee.id },
        sender: { userId: sender.id },
        payload: {
          message: {
            workspace: {
              id: workspace.id,
              name: workspace.title,
              update: {
                acceptInvitation: {
                  member: {
                    id: invitee.id,
                    name: invitee.username,
                    email: invitee.email
                  }
                }
              }
            }
          }
        }
      }),
      this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: sender.id },
        sender: { userId: sender.id },
        payload: {
          message: {
            workspace: {
              id: workspace.id,
              name: workspace.title,
              update: {
                acceptInvitation: {
                  member: {
                    id: invitee.id,
                    name: invitee.username,
                    email: invitee.email
                  }
                }
              }
            }
          }
        }
      })
    ])
  }

  private async notifyInvitationDeclined(
    workspace: WorkspaceModel,
    sender: UserModel,
    invitee: UserModel
  ): Promise<void> {
    await Promise.all([
      this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: invitee.id },
        sender: { userId: sender.id },
        payload: {
          message: {
            workspace: {
              id: workspace.id,
              name: workspace.title,
              update: {
                declineInvitation: {
                  invitee: {
                    id: invitee.id,
                    name: invitee.username,
                    email: invitee.email
                  }
                }
              }
            }
          }
        }
      }),
      this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: sender.id },
        sender: { userId: sender.id },
        payload: {
          message: {
            workspace: {
              id: workspace.id,
              name: workspace.title,
              update: {
                declineInvitation: {
                  invitee: {
                    id: invitee.id,
                    name: invitee.username,
                    email: invitee.email
                  }
                }
              }
            }
          }
        }
      })
    ])
  }

  private async notifyInvitationCanceled(
    workspace: WorkspaceModel,
    invitation: WorkspaceInvitationsModel
  ): Promise<void> {
    const isUserRegistered = await this.userService.isUserRegistered(invitation.email)

    if (isUserRegistered) {
      const [invitee, sender] = await Promise.all([
        this.userService.getUserByEmail(invitation.email),
        this.userService.getUser(invitation.senderId)
      ])

      await this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: invitee.id },
        sender: { userId: sender.id },
        payload: {
          message: {
            workspace: {
              id: workspace.id,
              name: workspace.title,
              update: {
                cancelInvitation: {
                  invitationId: invitation.id,
                  canceler: {
                    id: sender.id,
                    name: sender.username,
                    email: sender.email
                  }
                }
              }
            }
          }
        }
      })
    }

    // TODO: messagingService
  }

  private async sendInvitationInWorkspace(
    invitation: WorkspaceInvitationsModel,
    links: AdminInvitationLinks,
    isUserRegistered: boolean
  ) {
    const sender = this.mapper.map(invitation.sender, UserModel, UserSearchDto)

    if (isUserRegistered) {
      const [invitee, workspace] = await Promise.all([
        this.userService.getUserByEmail(invitation.email),
        this.getWorkspace(invitation.workspaceId)
      ])

      await this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: invitee.id },
        sender: { userId: invitation.senderId },
        payload: {
          message: {
            workspace: {
              id: workspace.id,
              name: workspace.title,
              update: {
                invitation: {
                  id: invitation.id,
                  inviter: {
                    id: sender.id,
                    name: sender.username,
                    email: sender.email
                  }
                }
              }
            }
          }
        }
      })

      this.eventService.sendEvent({
        userId: sender.id,
        workspace: {
          id: workspace.id,
          update: {
            invitee: {
              type: 'add',
              email: invitee.email,
              senderId: sender.id
            }
          }
        }
      })
    }

    await this.messagingService.publishNotification({
      type: 'WORKSPACE_INVITATION',
      recipient: { email: invitation.email },
      payload: links,
      lang: (I18nContext.current().lang as Lang) ?? 'ru'
    })
  }

  private isValidInvitation(invitation: WorkspaceInvitationsModel): boolean {
    return invitation.dateExpired > getCurrentUTCDateTime()
  }
}
