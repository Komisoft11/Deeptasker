import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { FileModel } from '../models/file.model'
import { TaskFileModel } from '../models/task-file.model'
import { UserModel } from '../../user/models/user.model'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { TaskModel } from '../../task/models/task.model'
import type { BufferedFile } from '../interfaces/buffered-file.interface'
import { MyBaseModel } from '../../common/database/base.model'
import { maxFileSize } from '../file-storage'
import { v4 } from 'uuid'
import path from 'path'
import { BucketService } from './bucket.service'
import { TransactionOrKnex } from 'objection'
import { Readable } from 'stream'
import { EventService } from '../../events/event.service'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { TaskCommentModel } from '../../task/comment/models/task-comment.model'
import { TaskCommentFileModel } from '../models/task-comment-file.model'
import { FILE_REPOSITORY, IFileRepository } from '../repositories/file-repository.interface'
import { UserService } from '../../user/user.service'

export interface IFile {
  customName: string
  file: BufferedFile
  filename?: string
}

export interface IFileMetadata {
  size: number
}

@Injectable()
export class FileService {
  public readonly maxFileSize: number = maxFileSize

  constructor(
    @Inject(FILE_REPOSITORY) private readonly fileRepository: IFileRepository,
    private readonly bucketService: BucketService,
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly i18n: I18nService
  ) {}

  public async uploadToTask(task: TaskModel, file: IFile, user: UserModel): Promise<FileModel> {
    const trx = await MyBaseModel.startTransaction()

    try {
      const uploadedFile = await this.upload(file, `task/${task.id}`, user.id, trx)

      const taskFile = await this.fileRepository.createTaskFile(
        task.id,
        uploadedFile.id,
        user.id,
        trx
      )

      await trx.commit()

      this.eventService
        .sendEvent({
          userId: user.id,
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              update: {
                file: {
                  id: uploadedFile.id,
                  originalName: uploadedFile.originalName,
                  userId: uploadedFile.userId,
                  size: uploadedFile.size,
                  dateCreated: new Date()
                }
              }
            }
          }
        })
        .then()
        .catch(e => console.error(e))

      return uploadedFile
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  public async uploadToTaskComment(
    taskComment: TaskCommentModel,
    task: TaskModel,
    file: IFile,
    user: UserModel
  ): Promise<FileModel> {
    const trx = await MyBaseModel.startTransaction()

    try {
      const uploadedFile = await this.upload(file, `task-comment/${taskComment.id}`, user.id, trx)

      await this.fileRepository.saveFileRefToTaskComment(
        taskComment.id,
        uploadedFile.id,
        user.id,
        trx
      )

      await trx.commit()

      this.eventService
        .sendEvent({
          userId: user.id,
          project: {
            id: task.projectId,
            task: {
              id: taskComment.taskId,
              update: {
                comment: {
                  type: 'add',
                  taskId: taskComment.taskId,
                  dto: {
                    user: user.getShortInfo(),
                    id: taskComment.id,
                    files: [uploadedFile]
                  }
                }
              }
            }
          }
        })
        .then()
        .catch(e => console.error(e))

      return uploadedFile
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  public async getFileContent(fileId: number): Promise<Readable> {
    const file = await this.getFile(fileId)

    return this.bucketService.get(file.filePath)
  }

  public async getFileMetadata(filePath: string): Promise<IFileMetadata> {
    const metadata = await this.bucketService.getMetadata(filePath)

    return {
      size: metadata.ContentLength
    }
  }

  public async upload(
    file: IFile,
    pathPrefix: string,
    userId: number,
    trx?: TransactionOrKnex
  ): Promise<FileModel> {
    const customFilename = file.filename ?? file.file.originalname

    const extension = path.extname(customFilename)

    const filename = v4() + extension

    const filePath = `${pathPrefix ? pathPrefix + '/' : ''}${filename}`

    const trx2 = await MyBaseModel.startTransaction(trx)
    try {
      const [uploadedFile] = await Promise.all([
        FileModel.query(trx2).insert({
          filePath: filePath,
          originalName: file.customName ? file.customName : customFilename,
          userId: userId,
          size: file.file.size
        }),
        this.bucketService.upload(file.file, filePath)
      ])
      await trx2.commit()

      return uploadedFile
    } catch (e) {
      console.error(e)
      await trx2.rollback()
      throw e
    }
  }

  public async deleteTaskFile(task: TaskModel, taskFile: TaskFileModel, user: UserModel) {
    await this.delete(taskFile.fileId)

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: task.projectId,
          task: {
            id: taskFile.taskId,
            update: {
              file: {
                id: taskFile.fileId as number,
                dateDeleted: getCurrentUTCDateTime()
              }
            }
          }
        }
      })
      .then()
      .catch(e => console.error(e))
  }

  public async delete(fileId: number, trx?: TransactionOrKnex): Promise<void> {
    const file = await this.getFile(fileId)

    await this.fileRepository.deleteFile(file.id, trx)

    await this.bucketService.delete(file.filePath)
  }

  public async getTaskFile(task: TaskModel, fileId: number): Promise<TaskFileModel> {
    const taskFile = await this.fileRepository.getTaskFile(task.id, fileId)

    if (!taskFile) {
      throw new NotFoundException(
        this.i18n.t('file.file_for_task_not_found', { lang: I18nContext.current().lang })
      )
    }

    return taskFile
  }

  public async getTaskCommentFile(
    taskComment: TaskCommentModel,
    fileId: number
  ): Promise<TaskCommentFileModel> {
    const commentFile = await this.fileRepository.getTaskCommentFile(taskComment.id, fileId)

    if (!commentFile) {
      throw new NotFoundException(
        this.i18n.t('file.file_for_task_not_found', { lang: I18nContext.current().lang })
      )
    }

    return commentFile
  }

  public async uploadUserAvatar(user: UserModel, file: IFile): Promise<FileModel> {
    const trx = await MyBaseModel.startTransaction()

    try {
      const uploadedFile = await this.upload(file, `user-avatar/${user.id}`, user.id, trx)

      const previousAvatarFileId = user.avatarId

      if (previousAvatarFileId) {
        await this.deleteUserAvatar(user, previousAvatarFileId, trx)
      }

      await this.userService.updateProfileAvatar(user, uploadedFile, trx)

      await trx.commit()

      return uploadedFile
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async getUserAvatar(fileId: number): Promise<FileModel> {
    return this.getFile(fileId)
  }

  private async getFile(id: number): Promise<FileModel> {
    const file = await this.fileRepository.getFile(id)

    if (!file) {
      throw new NotFoundException(
        this.i18n.t('file.file_not_found', { lang: I18nContext.current().lang })
      )
    }

    return file
  }

  public async deleteUserAvatar(
    user: UserModel,
    fileId: number,
    em?: TransactionOrKnex
  ): Promise<void> {
    const trx = await MyBaseModel.startTransaction(em)

    try {
      await this.userService.removeProfileAvatar(user, trx)

      await this.delete(fileId, trx)

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }
}
