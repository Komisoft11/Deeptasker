import { Injectable } from '@nestjs/common'
import { Repository } from '../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { IFileRepository } from './file-repository.interface'
import { TaskFileModel } from '../models/task-file.model'
import { TransactionOrKnex } from 'objection'
import { TaskCommentFileModel } from '../models/task-comment-file.model'
import { FileModel } from '../models/file.model'

@Injectable()
export class FileRepository extends Repository<TaskFileModel> implements IFileRepository {
  @InjectModel(TaskFileModel)
  model: TaskFileModel

  public async createTaskFile(
    taskId: number,
    fileId: number,
    userId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskFileModel> {
    return TaskFileModel.query(trx).insert({
      taskId: taskId,
      fileId: fileId,
      userId: userId
    })
  }

  public async saveFileRefToTaskComment(
    taskCommentId: number,
    fileId: number,
    userId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await TaskCommentFileModel.query(trx).insert({
      commentId: taskCommentId,
      fileId: fileId,
      userId: userId
    })
  }

  public async getFile(id: number): Promise<FileModel> {
    return FileModel.query().findOne({ id: id })
  }

  public async getTaskFile(taskId: number, fileId: number): Promise<TaskFileModel> {
    return TaskFileModel.query().findOne({ fileId: fileId, taskId: taskId }).withGraphJoined('file')
  }

  public async getTaskCommentFile(
    taskCommentId: number,
    fileId: number
  ): Promise<TaskCommentFileModel> {
    return TaskCommentFileModel.query()
      .findOne({ fileId: fileId, commentId: taskCommentId })
      .withGraphJoined('file')
  }

  public async deleteFile(id: number, trx?: TransactionOrKnex): Promise<void> {
    await FileModel.query(trx).delete().where('id', id).first()
  }
}
