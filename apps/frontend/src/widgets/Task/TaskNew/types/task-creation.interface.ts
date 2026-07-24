import { ITag } from '@/entities/Project'
import { IUser } from '@/entities/User'
import { IObserverUser } from '@/entities/User/model/types/user.interface'

export type TaskCreationData = {
  title: string
  status: string
  priority: string
  description?: string
  executor?: IUser
  assigner?: IUser
  observers?: IObserverUser[]
  tags?: ITag[]
  deadline?: Date
  sprintId?: number
}
