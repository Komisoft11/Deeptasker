import { FileModel } from '../../../file/models/file.model'

export interface ITaskFileEvent {
  id: number
  dateDeleted?: Date
  originalName?: string
  file?: FileModel
  userId?: number
  size?: number
  dateCreated?: Date
}