import { Injectable } from '@nestjs/common'
import { CacheRedisService } from '../cache-redis.service'
import { ProjectDto } from '../../project/dto/project/out/project.dto'
import { UserShortDto } from '../../common/dto/user-short.dto'
import { FolderDto } from '../../folder/dto/out/folder.dto'
import { MemberInvitationDto } from '../../project/dto/project/out/member-invitee.dto'
import { ReportDto } from 'src/report/dto/dto/report.dto'
import { cacheKeyCreator } from '../../common/const/cache-keys.geneartors'
import { SprintDto } from 'src/sprint/dto/out/sprint.dto'

@Injectable()
export class ProjectCacheService {
  constructor(private readonly cacheService: CacheRedisService) {}

  private static projectsKey(workspaceId: number, userId: number) {
    return cacheKeyCreator('workspace', workspaceId, 'user', userId, 'projects')
  }

  private static singleProjectKey(workspaceId: number, projectId: number) {
    return cacheKeyCreator('workspace', workspaceId, 'project', projectId)
  }

  private static foldersKey(projectId: number) {
    return cacheKeyCreator('project', projectId, 'folders')
  }

  private static membersKey(projectId: number) {
    return cacheKeyCreator('project', projectId, 'members')
  }

  private static inviteesKey(projectId: number) {
    return cacheKeyCreator('project', projectId, 'invitees')
  }

  private static reportsKey(projectId: number) {
    return cacheKeyCreator('project', projectId, 'reports')
  }

  private static sprintsKey(projectId: number) {
    return cacheKeyCreator('project', projectId, 'sprints')
  }

  public async set(workspaceId: number, userId: number, value: ProjectDto[]): Promise<void> {
    return this.cacheService.set<ProjectDto[]>(
      ProjectCacheService.projectsKey(workspaceId, userId),
      value
    )
  }

  public async get(workspaceId: number, userId: number): Promise<ProjectDto[]> {
    return this.cacheService.get<ProjectDto[]>(ProjectCacheService.projectsKey(workspaceId, userId))
  }

  public async delete(workspaceId: number, userId: number): Promise<void> {
    return this.cacheService.delete(ProjectCacheService.projectsKey(workspaceId, userId))
  }

  public async setSingleProject(
    workspaceId: number,
    projectId: number,
    value: ProjectDto
  ): Promise<void> {
    return this.cacheService.set<ProjectDto>(
      ProjectCacheService.singleProjectKey(workspaceId, projectId),
      value
    )
  }

  public async getSingleProject(workspaceId: number, projectId: number): Promise<ProjectDto> {
    return this.cacheService.get<ProjectDto>(
      ProjectCacheService.singleProjectKey(workspaceId, projectId)
    )
  }

  public async deleteSingleProject(workspaceId: number, projectId: number): Promise<void> {
    return this.cacheService.delete(ProjectCacheService.singleProjectKey(workspaceId, projectId))
  }

  public async setFolders(projectId: number, value: FolderDto[]): Promise<void> {
    return this.cacheService.set<FolderDto[]>(ProjectCacheService.foldersKey(projectId), value)
  }

  public async getFolders(projectId: number): Promise<FolderDto[]> {
    return this.cacheService.get<FolderDto[]>(ProjectCacheService.foldersKey(projectId))
  }

  public async deleteFolders(projectId: number): Promise<void> {
    return this.cacheService.delete(ProjectCacheService.foldersKey(projectId))
  }

  public async setMembers(projectId: number, value: UserShortDto[]): Promise<void> {
    return this.cacheService.set<UserShortDto[]>(ProjectCacheService.membersKey(projectId), value)
  }

  public async getMembers(projectId: number): Promise<UserShortDto[]> {
    return this.cacheService.get<UserShortDto[]>(ProjectCacheService.membersKey(projectId))
  }

  public async deleteMembers(projectId: number): Promise<void> {
    return this.cacheService.delete(ProjectCacheService.membersKey(projectId))
  }

  public async setInvitees(projectId: number, value: MemberInvitationDto[]): Promise<void> {
    return this.cacheService.set<MemberInvitationDto[]>(
      ProjectCacheService.inviteesKey(projectId),
      value
    )
  }

  public async getInvitees(projectId: number): Promise<MemberInvitationDto[]> {
    return this.cacheService.get<MemberInvitationDto[]>(ProjectCacheService.inviteesKey(projectId))
  }

  public async deleteInvitees(projectId: number): Promise<void> {
    return this.cacheService.delete(ProjectCacheService.inviteesKey(projectId))
  }

  public async setReports(projectId: number, value: ReportDto[]): Promise<void> {
    return this.cacheService.set<ReportDto[]>(ProjectCacheService.reportsKey(projectId), value)
  }

  public async getReports(projectId: number): Promise<ReportDto[]> {
    return this.cacheService.get<ReportDto[]>(ProjectCacheService.reportsKey(projectId))
  }

  public async deleteReports(projectId: number): Promise<void> {
    return this.cacheService.delete(ProjectCacheService.reportsKey(projectId))
  }

  public async setSprints(projectId: number, value: SprintDto[]): Promise<void> {
    return this.cacheService.set<SprintDto[]>(ProjectCacheService.sprintsKey(projectId), value)
  }

  public async getSprints(projectId: number): Promise<SprintDto[]> {
    return this.cacheService.get<SprintDto[]>(ProjectCacheService.sprintsKey(projectId))
  }

  public async deleteSprints(projectId: number): Promise<void> {
    return this.cacheService.delete(ProjectCacheService.sprintsKey(projectId))
  }
}
