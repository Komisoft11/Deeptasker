import { Allow, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'
import { IWorkspaceEvent } from '../interfaces/workspace/workspace-event.interface'
import { IProjectEvent } from '../interfaces/project/project-event.interface'
import { INotificationEvent } from '../interfaces/notification/notification-event.interface'

export class EventDto {
  @IsNotEmpty()
  userId: number

  @IsOptional()
  @IsBoolean()
  isOrigin?: boolean

  @Allow()
  workspace?: IWorkspaceEvent

  @Allow()
  project?: IProjectEvent

  @Allow()
  notification?: INotificationEvent
}
