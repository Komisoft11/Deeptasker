import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { TaskFileModel } from '../models/task-file.model'
import { TransactionOrKnex } from 'objection'
import { FileModel } from '../models/file.model'
import { TaskCommentFileModel } from '../models/task-comment-file.model'

export const FILE_REPOSITORY = 'file_repository'

export interface IFileRepository extends RepositoryContract<TaskFileModel> {
  query<R = TaskFileModel>(): CustomQueryBuilder<TaskFileModel, R>

  createTaskFile(
    taskId: number,
    fileId: number,
    userId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskFileModel>

  saveFileRefToTaskComment(
    taskCommentId: number,
    fileId: number,
    userId: number,
    trx?: TransactionOrKnex
  ): Promise<void>

  getFile(id: number): Promise<FileModel>

  getTaskFile(taskId: number, fileId: number): Promise<TaskFileModel>

  getTaskCommentFile(taskCommentId: number, fileId: number): Promise<TaskCommentFileModel>

  deleteFile(id: number, trx?: TransactionOrKnex): Promise<void>
}
