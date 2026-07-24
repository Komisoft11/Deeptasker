import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateFolderDto } from './dto/in/create-folder.dto'
import { UserModel } from '../user/models/user.model'
import { MyBaseModel } from '../common/database/base.model'
import { FOLDER_REPOSITORY, IFolderRepository } from './repositories/folder-repository.interface'
import { FolderModel } from './model/folder.model'
import { UpdateFolderDto } from './dto/in/update-folder.dto'
import { ProjectModel } from '../project/models/project.model'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { FolderDto } from './dto/out/folder.dto'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { EventService } from '../events/event.service'
import { ProjectCacheService } from '../cache/services/project.cache-service'

@Injectable()
export class FolderService {
  constructor(
    @Inject(FOLDER_REPOSITORY) private readonly folderRepository: IFolderRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly eventService: EventService,
    private i18n: I18nService,
    private readonly projectCacheService: ProjectCacheService
  ) {}

  public async getFoldersByProject(project: ProjectModel, user: UserModel): Promise<FolderDto[]> {
    const cached = await this.projectCacheService.getFolders(project.id)

    if (cached) {
      return cached
    }

    const folders = await this.folderRepository.getFolders(project.id)

    const dto = this.mapper.mapArray(folders, FolderModel, FolderDto)

    await this.projectCacheService.setFolders(project.id, dto)

    return dto
  }

  public async create(createFolderDto: CreateFolderDto, user: UserModel): Promise<FolderModel> {
    const trx = await MyBaseModel.startTransaction()

    try {
      if (createFolderDto.title === null || !createFolderDto.title.length) {
        createFolderDto.title = this.i18n.t('folder.default_name', {
          lang: I18nContext.current().lang
        })
      }

      createFolderDto.title = await this.getAvailableTitle(
        createFolderDto.title,
        createFolderDto.projectId,
        createFolderDto.parentId
      )

      const folder = await this.folderRepository.createFolder(createFolderDto, user, trx)

      // TODO: Create order mover

      this.eventService
        .sendEvent({
          userId: user.id,
          project: {
            id: folder.projectId,
            folder: {
              id: folder.id,
              create: {
                id: folder.id,
                title: folder.title,
                userId: folder.userId,
                projectId: folder.projectId,
                parentId: folder.parentId,
                dateUpdated: folder.dateUpdated,
                dateCreated: folder.dateCreated,
                customOrder: folder.customOrder,
                subFolderIds: [],
                taskCount: folder.taskCount,
                user: folder.user
              }
            }
          }
        })
        .then()
        .catch(console.error)

      await trx.commit()

      await this.projectCacheService.deleteFolders(createFolderDto.projectId)

      return folder
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async getFolder(id: number) {
    const folder = await this.folderRepository.getFolder(id)

    if (!folder) {
      throw new NotFoundException(
        this.i18n.t('folder.not_found', {
          lang: I18nContext.current().lang,
          args: { taskId: id }
        })
      )
    }

    return folder
  }

  public async update(
    folder: FolderModel,
    updateFolderDto: UpdateFolderDto,
    user: UserModel
  ): Promise<void> {
    if (updateFolderDto.title && updateFolderDto.title !== folder.title) {
      const isTitleExists = await this.folderRepository.isTitleExists(
        updateFolderDto.title,
        folder.projectId,
        folder.parentId
      )

      if (isTitleExists) {
        throw new BadRequestException(
          this.i18n.t('folder.title_exists', { lang: I18nContext.current().lang })
        )
      }
    }

    await this.folderRepository.updateFolder(folder.id, updateFolderDto)

    await this.projectCacheService.deleteFolders(folder.projectId)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: folder.projectId,
          folder: {
            id: folder.id,
            update: {
              projectId: updateFolderDto.newProjectId,
              parentId: updateFolderDto.newParentId,
              customOrder: updateFolderDto.customOrder,
              title: updateFolderDto.title
            }
          }
        }
      })
      .then()
      .catch(console.error)

    // TODO: create notification service
  }

  public async delete(folder: FolderModel, user: UserModel) {
    const trx = await MyBaseModel.startTransaction()

    try {
      await this.folderRepository.deleteFolder(folder.id, trx)

      await this.folderRepository.deleteChildren(folder.id, trx)

      // TODO: crate notification event

      this.eventService
        .sendEvent({
          userId: user.id,
          project: {
            id: folder.projectId,
            folder: {
              id: folder.id,
              delete: {
                projectId: folder.projectId,
                dateDeleted: new Date()
              }
            }
          }
        })
        .then()
        .catch(console.error)

      await trx.commit()

      await this.projectCacheService.deleteFolders(folder.projectId)
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  private async getAvailableTitle(
    title: string,
    projectId: number,
    parentId?: number
  ): Promise<string> {
    let baseTitle = title
    let i = 2

    while (await this.folderRepository.isTitleExists(title, projectId, parentId)) {
      title = `${baseTitle} [${i}]`
      i++
    }

    return title
  }
}
