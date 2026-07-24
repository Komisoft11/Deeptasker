import { CreateProjectDto, ProjectSettingsDto } from '../../dto/project/in/create-project.dto'
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { UpdateProjectDto } from '../../dto/project/in/update-project.dto'
import { encodeHtmlTags } from '../../../common/decorators/strip-tags.decorator'
import { TaskService } from '../../../task/services/task.service'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { TaskResponse } from '../../../task/dto'
import { IProjectWithWorkspace, ProjectModel } from '../../models/project.model'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { TransactionOrKnex } from 'objection'
import type { IProjectRepository } from '../../repositories/project/project-repository.interface'
import { PROJECT_REPOSITORY } from '../../repositories/project/project-repository.interface'
import { WorkspaceModel } from '../../../workspace/models/workspace.model'
import { UserModel } from '../../../user/models/user.model'
import { MoveDto } from '../../dto/project/in/move.dto'
import { EventService } from '../../../events/event.service'
import { TaskStatusService } from '../task-status/task-status.service'
import { MyBaseModel } from '../../../common/database/base.model'
import type { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { ProjectDto } from '../../dto/project/out/project.dto'
import { PermissionsRoleDto } from '../../dto/project/in/permissions/permissions-role.dto'
import { ProjectPermissionsModel } from '../../models/project-permissions.model'
import { WorkspaceService } from '../../../workspace/services/workspace/workspace.service'
import { ProjectOrderProducerService } from '../../../async-job/project/order/project-order.producer.service'
import { GlobalRole } from '../../../user/access/enum.role'
import { IProjectService } from './interfaces/project.service.interface'
import { PlanService } from '../../../payment/services/plan.service'
import { ProjectMover } from '../../components/project-mover'
import { FolderService } from '../../../folder/folder.service'
import { FolderDto } from '../../../folder/dto/out/folder.dto'
import { ProjectInvitationsModel } from '../../models/project-invitations.model'
import {
  IProjectInvitationsRepository,
  PROJECT_INVITATIONS_REPOSITORY
} from '../../repositories/invitations/project-invitations-repository.interface'
import { InviteUserDto } from '../../dto/project/in/invite-user.dto'
import { UUID } from 'crypto'
import { CancelInviteUserDto } from '../../dto/project/in/cancel-invite-user.dto'
import { UserService } from '../../../user/user.service'
import { ConfigService } from '@nestjs/config'
import { InviteUserLinks } from '../../interfaces/invite-user.interface'
import { UserSearchDto } from '../../../user/dto/out/user-search.dto'
import { transformToSlug } from '../../../common/helpers/strings'
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service'
import {
  ProjectRoleEnum,
  ProjectRoleType
} from '../../components/permissions/types/roles/project-role.interface'
import { ProjectCacheService } from '../../../cache/services/project.cache-service'
import { UserShortDto } from '../../../common/dto/user-short.dto'
import { MemberInvitationDto } from '../../dto/project/out/member-invitee.dto'
import { NotificationService } from '../../../notification/notification.service'
import type { Lang } from '../../../notification/types'

export type ProjectExtraProperties = Array<'members' | 'user'>

const defaultProjectSettings: ProjectSettingsDto = {
  isReviewRequired: false
}

@Injectable()
export class ProjectService implements IProjectService {
  constructor(
    @Inject(forwardRef(() => TaskService)) private readonly taskService: TaskService,
    @Inject(forwardRef(() => FolderService)) private readonly folderService: FolderService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => WorkspaceService)) private workspaceService: WorkspaceService,
    @Inject(forwardRef(() => PlanService)) private planService: PlanService,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_INVITATIONS_REPOSITORY)
    private readonly projectInvitationsRepository: IProjectInvitationsRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly i18n: I18nService,
    private readonly taskStatusService: TaskStatusService,
    private readonly eventService: EventService,
    private readonly projectOrderService: ProjectOrderProducerService,
    private readonly projectMover: ProjectMover,
    private readonly configService: ConfigService,
    private readonly projectPermissionsService: ProjectPermissionsService,
    private readonly projectCacheService: ProjectCacheService,
    private readonly messagingService: NotificationService
  ) {}

  public async create(
    createProjectDto: CreateProjectDto,
    workspace: WorkspaceModel,
    user: UserModel,
    createDefaultStatuses: boolean = true,
    transaction?: TransactionOrKnex
  ): Promise<ProjectModel> {
    encodeHtmlTags(createProjectDto)

    createProjectDto.title = await this.getAvailableTitle(createProjectDto.title, workspace.id)

    const slug = await this.getAvailableSlug(transformToSlug(createProjectDto.slug))

    if (
      user.role !== GlobalRole.Admin &&
      !(await this.planService.canCreateProjects(workspace, user))
    ) {
      throw new ForbiddenException(
        this.i18n.t('project.too_many_projects_upgrade_plan', { lang: I18nContext.current().lang })
      )
    }

    const trx = await MyBaseModel.startTransaction(transaction)

    try {
      const project = await this.projectRepository.createProject(
        createProjectDto,
        workspace.id,
        user.id,
        slug,
        trx
      )

      await this.projectMover.upOrderTop(project, trx)

      if (createDefaultStatuses) {
        project.statuses = await this.taskStatusService.createDefaultStatuses(project, trx)
      } else {
        project.statuses = [await this.taskStatusService.createOpenStatus(project, trx)]
      }

      project.settings = await this.projectRepository.addProjectSettings(
        project,
        defaultProjectSettings,
        trx
      )

      await this.giveFullPermissionsToWorkspaceAdminsAndProjectOwner(project, user, trx)

      await trx.commit()

      await this.projectCacheService.delete(workspace.id, user.id)

      this.eventService
        .sendEvent({
          userId: user.id,
          workspace: {
            id: project.workspaceId,
            project: {
              id: project.id,
              create: this.mapper.map(project, ProjectModel, ProjectDto)
            }
          }
        })
        .then()
        .catch(e => {
          console.error(e)
        })

      return project
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async update(
    project: ProjectModel,
    updateProjectDto: UpdateProjectDto,
    user: UserModel
  ): Promise<void> {
    encodeHtmlTags(updateProjectDto)

    if (updateProjectDto.slug && updateProjectDto.slug !== project.slug) {
      const isSlugExists = await this.projectRepository.isSlugExists(
        transformToSlug(updateProjectDto.slug)
      )

      if (isSlugExists) {
        throw new BadRequestException(
          this.i18n.t('project.slug_exists', { lang: I18nContext.current().lang })
        )
      }
    }

    if (updateProjectDto.title && updateProjectDto.title !== project.title) {
      const isTitleExists = await this.projectRepository.isTitleExists(
        updateProjectDto.title,
        project.workspaceId
      )

      if (isTitleExists) {
        throw new BadRequestException(
          this.i18n.t('project.title_exists', { lang: I18nContext.current().lang })
        )
      }
    }

    await this.projectRepository.updateProject(project, updateProjectDto)

    await this.projectCacheService.delete(project.workspaceId, user.id)
    await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

    this.eventService
      .sendEvent({
        userId: user.id,
        workspace: {
          id: project.workspaceId,
          project: {
            id: project.id,
            update: updateProjectDto
          }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async delete(project: ProjectModel, user: UserModel) {
    const trx = await MyBaseModel.startTransaction()

    try {
      const invitees = await this.getInvitees(project)

      if (invitees.length) {
        await Promise.all(
          invitees.map(invitee =>
            this.cancelInviteUser(
              project,
              {
                email: invitee.email
              },
              user,
              trx
            )
          )
        )
      }

      await this.projectRepository.deleteProject(project.id, trx)

      await trx.commit()

      await this.projectCacheService.delete(project.workspaceId, user.id)
      await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

      this.eventService
        .sendEvent({
          userId: user.id,
          workspace: {
            id: project.workspaceId,
            project: {
              id: project.id,
              delete: { dateDeleted: getCurrentUTCDateTime() }
            }
          }
        })
        .then()
        .catch(e => {
          console.error(e)
        })
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async getProjectTasks(project: ProjectModel): Promise<TaskResponse[]> {
    return this.taskService.getTasksByProject(project)
  }

  public async getProjectFolders(project: ProjectModel, user: UserModel): Promise<FolderDto[]> {
    return this.folderService.getFoldersByProject(project, user)
  }

  public async get(id: number): Promise<ProjectModel> {
    const project = await this.projectRepository.getProject(id)

    if (!project) {
      throw new NotFoundException(
        this.i18n.t('project.not_found', { lang: I18nContext.current().lang })
      )
    }

    return project
  }

  public async getBySlugInWorkspace(workspaceId: number, slug: string): Promise<ProjectModel> {
    const project = await this.projectRepository.getBySlugInWorkspace(workspaceId, slug)

    if (!project) {
      throw new NotFoundException(
        this.i18n.t('project.not_found', { lang: I18nContext.current().lang })
      )
    }

    return project
  }

  public async getProjectsByUser(
    user: UserModel,
    workspace: WorkspaceModel
  ): Promise<ProjectDto[]> {
    const cached = await this.projectCacheService.get(workspace.id, user.id)

    if (cached) {
      return cached
    }

    const projects = await this.projectRepository.getProjectsByUser(user, workspace)

    await Promise.all(projects.map(p => Promise.all([p.loadTaskCount(), p.loadFolderCount()])))

    const dto = this.mapper.mapArray(projects, ProjectModel, ProjectDto)

    await this.projectCacheService.set(workspace.id, user.id, dto)

    return dto
  }

  public async getSingleProjectByUser(
    id: number,
    workspace: WorkspaceModel,
    user: UserModel
  ): Promise<ProjectDto> {
    const cached = await this.projectCacheService.getSingleProject(workspace.id, id)

    if (cached) return cached

    const project = await this.projectRepository.getProjectByUser(id, workspace, user)

    const dto = this.mapper.map(project, ProjectModel, ProjectDto)

    await this.projectCacheService.setSingleProject(workspace.id, id, dto)

    return dto
  }

  public async hasProjectAccess(
    user: UserModel,
    projectId: number,
    projectRole?: ProjectRoleType
  ): Promise<boolean> {
    return this.projectRepository.hasProjectAccess(user, projectId, projectRole)
  }

  public async giveGuestAccessToProject(
    project: ProjectModel,
    userIdToGiveAccess: number,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    const projectUser = await this.projectRepository.pathGuestAccessToProject(
      project,
      userIdToGiveAccess,
      trx
    )

    this.sendProjectAccessGiveEvent(project, projectUser, user).catch(e => {
      console.error(e)
    })
  }

  public async inviteUser(
    project: ProjectModel,
    inviteUserDto: InviteUserDto,
    sender: UserModel
  ): Promise<void> {
    const { email, role } = inviteUserDto

    const invitation = await this.projectInvitationsRepository.getInvitationByInviteeEmail(
      email,
      project.id
    )

    if (invitation) {
      throw new ForbiddenException('User is already invited to this project')
    }

    const trx = await MyBaseModel.startTransaction()

    try {
      const invitation = await this.projectInvitationsRepository.inviteUser(
        project,
        email,
        sender,
        role,
        trx
      )

      const links = await this.generateUserInvitationLinks(invitation)

      await trx.commit()

      await this.sendInvitationInProject(invitation, links)

      await this.projectCacheService.deleteInvitees(project.id)
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async cancelInviteUser(
    project: ProjectModel,
    cancelInviteUserDto: CancelInviteUserDto,
    user: UserModel,
    transaction?: TransactionOrKnex
  ): Promise<void> {
    const invitation = await this.projectInvitationsRepository.getInvitationByInviteeEmail(
      cancelInviteUserDto.email,
      project.id
    )

    if (user.id !== invitation.senderId) {
      throw new ForbiddenException('You can not cancel this invite')
    }

    const trx = await MyBaseModel.startTransaction(transaction)

    try {
      await this.projectInvitationsRepository.removeInvitation(invitation.id, trx)

      await trx.commit()

      await this.notifyInvitationCanceled(project, invitation)

      await this.projectCacheService.deleteInvitees(project.id)

      this.eventService
        .sendEvent({
          userId: invitation.senderId,
          project: {
            id: project.id,
            update: {
              invitee: {
                type: 'remove',
                email: invitation.email
              }
            }
          }
        })
        .then()
        .catch(e => {
          e
        })
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async giveAccessToProject(
    project: ProjectModel,
    userIdToGiveAccess: number,
    permissionsDto: PermissionsRoleDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    // if user created project, no need to add him to project
    if (project.userId === userIdToGiveAccess) {
      throw new BadRequestException(
        this.i18n.t('project.user_is_owner_of_project', {
          lang: I18nContext.current().lang,
          args: { userId: userIdToGiveAccess, projectId: project.id }
        })
      )
    }

    if (!(await this.planService.canAddUserToProject(project))) {
      throw new ForbiddenException(
        this.i18n.t('project.too_many_users_in_project', {
          lang: I18nContext.current().lang
        })
      )
    }

    const hasAccessToProject = await this.projectPermissionsService.hasAccessToProject(
      project.id,
      userIdToGiveAccess
    )

    if (hasAccessToProject) {
      throw new BadRequestException('User already has access to project ' + project.id)
    }

    const projectUser = await this.projectPermissionsService.giveProjectRolePermissionsToUser(
      project.id,
      userIdToGiveAccess,
      permissionsDto,
      trx
    )

    this.sendProjectAccessGiveEvent(project, projectUser, user)
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async removeUserFromProject(
    project: ProjectModel,
    userToRemove: UserModel,
    user: UserModel
  ): Promise<void> {
    await this.projectRepository.removeUserFromProject(project, userToRemove)

    await Promise.all([
      this.projectCacheService.delete(project.workspaceId, userToRemove.id),
      this.projectCacheService.deleteMembers(project.id)
    ])

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          update: {
            member: {
              type: 'remove',
              user: userToRemove.getShortInfo()
            }
          }
        }
      })
      .catch(e => console.error(e))

    this.eventService
      .sendEvent({
        userId: user.id,
        workspace: {
          id: project.workspaceId,
          project: {
            id: project.id,
            delete: {
              dateDeleted: getCurrentUTCDateTime()
            }
          }
        }
      })
      .catch(e => console.error(e))
  }

  public async move(project: ProjectModel, moveDto: MoveDto, user: UserModel) {
    await this.projectOrderService.changeOrder({
      projectId: project.id,
      order: moveDto.order,
      userId: user.id
    })

    await this.projectCacheService.delete(project.workspaceId, user.id)
  }

  public async updateUserPermissions(
    userToEdit: UserModel,
    project: ProjectModel,
    projectPermissionsDto: PermissionsRoleDto,
    user: UserModel
  ) {
    if (project.userId === userToEdit.id) {
      throw new BadRequestException('Cannot edit permissions of project owner')
    }

    const workspace = await this.workspaceService.getWorkspace(project.workspaceId)
    const isWorkspaceAdmin = await this.workspaceService.isWorkspaceAdmin(workspace, userToEdit)

    if (isWorkspaceAdmin) {
      throw new BadRequestException('This user is workspace admin')
    }

    await this.projectPermissionsService.updateProjectRolePermissionsForUser(
      project.id,
      userToEdit.id,
      projectPermissionsDto
    )

    await this.projectCacheService.deleteMembers(project.id)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          update: {
            member: {
              type: 'updatePermissions',
              user: userToEdit.getShortInfo(),
              role: projectPermissionsDto.role,
              permissions: projectPermissionsDto.permissions
            }
          }
        }
      })
      .then()
      .catch(e => console.error(e))
  }

  public async getMembers(project: ProjectModel): Promise<UserShortDto[]> {
    const cached = await this.projectCacheService.getMembers(project.id)

    if (cached) {
      return cached
    }

    const members = await this.projectRepository.getMembers(project)

    const dto = this.mapper.mapArray(members, UserModel, UserShortDto)

    await this.projectCacheService.setMembers(project.id, dto)

    return dto
  }

  public async getInvitees(project: ProjectModel): Promise<MemberInvitationDto[]> {
    const cached = await this.projectCacheService.getInvitees(project.id)

    if (cached) {
      return cached
    }

    const invitees = await this.projectInvitationsRepository.getInvitees(project)

    if (!invitees.length) {
      return []
    }

    const dto = this.mapper.mapArray(invitees, ProjectInvitationsModel, MemberInvitationDto)

    await this.projectCacheService.setInvitees(project.id, dto)

    return dto
  }

  public async getNumberOfMembers(
    project: IProjectWithWorkspace,
    trx?: TransactionOrKnex
  ): Promise<number> {
    return this.projectRepository.getNumberOfMembers(project, trx)
  }

  public async archive(
    project: ProjectModel,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    const currentDate = getCurrentUTCDateTime()

    await this.projectRepository.updateProject(project, { dateArchived: currentDate }, trx)

    await this.projectCacheService.delete(project.workspaceId, user.id)
    await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          update: { dateArchived: currentDate }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async createDefault(
    workspace: WorkspaceModel,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<ProjectModel> {
    const title = this.i18n.t('project.default_name', { lang: I18nContext.current().lang })
    const slug = this.i18n.t('project.default_name', { lang: 'en' })

    await this.projectCacheService.delete(workspace.id, user.id)

    return this.create({ title, slug }, workspace, user, true, trx)
  }

  public async getProjectsByWorkspace(workspace: WorkspaceModel): Promise<ProjectModel[]> {
    return this.projectRepository.getProjectsByWorkspace(workspace)
  }

  public async acceptUserInvitation(invitation: ProjectInvitationsModel): Promise<string> {
    await this.validateInvitation(invitation)

    const [invitee, project] = await Promise.all([
      this.userService.getUserByEmail(invitation.email),
      this.get(invitation.projectId)
    ])

    const trx = await MyBaseModel.startTransaction()

    try {
      const sender = await this.userService.getUser(invitation.senderId, trx)
      await Promise.all([
        this.giveAccessToProject(
          project,
          invitee.id,
          { role: invitation.role ?? ProjectRoleEnum.guest },
          sender,
          trx
        ),
        this.notifyInvitationAccepted(project, sender, invitee)
      ])

      await this.projectInvitationsRepository.removeInvitation(invitation.id, trx)

      await trx.commit()

      await Promise.all([
        this.projectCacheService.delete(project.workspaceId, invitee.id),
        this.projectCacheService.deleteMembers(project.id),
        this.projectCacheService.deleteInvitees(project.id)
      ])

      await Promise.all([
        this.eventService.sendEvent({
          userId: invitee.id,
          project: {
            id: project.id,
            update: {
              member: {
                type: 'add',
                user: invitee,
                role: invitation.role
              }
            }
          }
        }),
        this.eventService.sendEvent({
          userId: invitee.id,
          project: {
            id: project.id,
            update: {
              invitee: {
                type: 'remove',
                email: invitee.email
              }
            }
          }
        })
      ])

      return this.getClientAcceptedProjectUrl(project)
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async declineUserInvitation(invitation: ProjectInvitationsModel): Promise<string> {
    await this.validateInvitation(invitation)

    const [invitee, project] = await Promise.all([
      this.userService.getUserByEmail(invitation.email),
      this.get(invitation.projectId)
    ])

    const trx = await MyBaseModel.startTransaction()

    try {
      const sender = await this.userService.getUser(invitation.senderId, trx)

      await this.projectInvitationsRepository.removeInvitation(invitation.id, trx)

      await trx.commit()

      await this.notifyInvitationDeclined(project, sender, invitee)

      await this.projectCacheService.deleteInvitees(project.id)

      await this.eventService.sendEvent({
        userId: invitee.id,
        project: {
          id: project.id,
          update: {
            invitee: {
              type: 'remove',
              email: invitee.email
            }
          }
        }
      })

      return this.getClientDeclinedProjectUrl()
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  private async giveFullPermissionsToWorkspaceAdminsAndProjectOwner(
    project: ProjectModel,
    user: UserModel,
    trx: TransactionOrKnex
  ) {
    const [workspace, workspaceAdmins] = await Promise.all([
      this.projectRepository.getWorkspace(project, trx),
      this.projectRepository.getWorkspaceAdmins(project.workspaceId, trx)
    ])

    // workspace admins
    const admins = new Set(workspaceAdmins.map(workspaceUserModel => workspaceUserModel.userId))

    // workspace owner
    admins.add(workspace.userId)

    // project owner
    admins.add(project.userId)

    await this.projectPermissionsService.giveProjectRolePermissionsToUsers(
      project.id,
      [...admins],
      { role: ProjectRoleEnum.admin },
      trx
    )

    await this.projectCacheService.delete(project.workspaceId, user.id)
  }

  private async getAvailableSlug(slug: string): Promise<string> {
    let baseSlug = slug
    let i = 1

    while (await this.projectRepository.isSlugExists(slug)) {
      slug = `${baseSlug}_${i}`
      i++
    }

    return slug
  }

  private async sendProjectAccessGiveEvent(
    project: ProjectModel,
    projectUser: ProjectPermissionsModel,
    user: UserModel
  ) {
    return this.eventService.sendEvent({
      userId: user.id,
      project: {
        id: project.id,
        update: {
          member: {
            type: 'add',
            user: (
              await projectUser.$relatedQuery<UserModel>('user').modify('selectShortColor').first()
            ).getShortInfo(),
            role: projectUser.role
          }
        }
      }
    })
  }

  private async getAvailableTitle(title: string, workspaceId: number): Promise<string> {
    let baseTitle = title
    let i = 2

    while (await this.projectRepository.isTitleExists(title, workspaceId)) {
      title = `${baseTitle} [${i}]`
      i++
    }

    return title
  }

  private async generateUserInvitationLinks(
    invitation: ProjectInvitationsModel
  ): Promise<InviteUserLinks> {
    const project = await this.get(invitation.projectId)

    const acceptLink = `${this.configService.get('SERVER_URL')}/workspaces/${
      project.workspaceId
    }/projects/accept-invitation/${invitation.token}`
    const declineLink = `${this.configService.get('SERVER_URL')}/workspaces/${
      project.workspaceId
    }/projects/decline-invitation/${invitation.token}`

    return { acceptLink, declineLink }
  }

  private async validateInvitation(invitation: ProjectInvitationsModel) {
    if (!this.isValidInvitation(invitation)) {
      await this.projectInvitationsRepository.removeInvitation(invitation.id)
      throw new ForbiddenException('Invitation not valid')
    }
  }

  public async getInvitationByToken(token: UUID) {
    const invitation = await this.projectInvitationsRepository.getInvitationByToken(token)

    if (!invitation) {
      throw new NotFoundException('Invitation not found')
    }

    return invitation
  }

  private isValidInvitation(invitation: ProjectInvitationsModel): boolean {
    return invitation.dateExpired > getCurrentUTCDateTime()
  }

  private async sendInvitationInProject(
    invitation: ProjectInvitationsModel,
    links: InviteUserLinks
  ): Promise<void> {
    const [invitee, project] = await Promise.all([
      this.userService.getUserByEmail(invitation.email),
      this.get(invitation.projectId)
    ])

    const sender = this.mapper.map(invitation.sender, UserModel, UserSearchDto)

    if (invitee) {
      await this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: invitee.id },
        sender: { userId: sender.id },
        payload: {
          message: {
            project: {
              id: project.id,
              workspaceId: project.workspaceId,
              name: project.title,
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
        project: {
          id: project.id,
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
      type: 'PROJECT_INVITATION',
      recipient: { email: invitation.email },
      payload: links,
      lang: (I18nContext.current().lang as Lang) ?? 'ru'
    })
  }

  private getClientAcceptedProjectUrl(project: ProjectModel): string {
    return (
      this.configService.get('CLIENT_URL') + `/space/${project.workspaceId}/p/${project.slug}/table`
    )
  }

  private getClientDeclinedProjectUrl(): string {
    return this.configService.get('CLIENT_URL')
  }

  private async notifyInvitationAccepted(
    project: ProjectModel,
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
            project: {
              id: project.id,
              workspaceId: project.workspaceId,
              name: project.title,
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
            project: {
              id: project.id,
              workspaceId: project.workspaceId,
              name: project.title,
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
    project: ProjectModel,
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
            project: {
              id: project.id,
              workspaceId: project.workspaceId,
              name: project.title,
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
            project: {
              id: project.id,
              workspaceId: project.workspaceId,
              name: project.title,
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
    project: ProjectModel,
    invitation: ProjectInvitationsModel
  ): Promise<void> {
    const [invitee, sender] = await Promise.all([
      this.userService.getUserByEmail(invitation.email),
      this.userService.getUser(invitation.senderId)
    ])

    const notifies = [
      this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: sender.id },
        sender: { userId: sender.id },
        payload: {
          message: {
            project: {
              id: project.id,
              workspaceId: project.workspaceId,
              name: project.title,
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
    ]

    if (invitee) {
      notifies.push(
        this.messagingService.publishNotification({
          type: 'PUBLISH_DOMESTIC_NOTIFICATION',
          recipient: { userId: sender.id },
          sender: { userId: sender.id },
          payload: {
            message: {
              project: {
                id: project.id,
                workspaceId: project.workspaceId,
                name: project.title,
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
      )
    }

    await Promise.all(notifies)
  }
}
