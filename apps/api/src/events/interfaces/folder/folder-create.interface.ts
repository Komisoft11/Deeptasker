import { UserShortDto } from '../../../common/dto/user-short.dto'
import { UserModel } from '../../../user/models/user.model'

export interface IFolderCreateEvent {
  id: number

  title: string

  userId: number

  projectId: number

  parentId?: number

  dateUpdated?: Date

  dateCreated: Date

  customOrder: number

  taskIds?: number[]

  subFolderIds: number[]

  taskCount: number

  user: UserModel
}