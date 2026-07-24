import { ProjectDto } from '../../../project/dto/project/out/project.dto'
import { IEntityDeleteEvent } from '../entity-delete.event'
import { IProjectUpdateEvent } from './project-update.event'
import { ITaskEvent } from '../task/task-event.interface'
import { IFolderEvent } from '../folder/folder-event.interface'
import { IReportEvent } from '../report/report.event.interface'
import { ISprintEvent } from '../sprint/sprint.event.interface'
import { CreateTagDto } from '../../../task/tag/dto/in/create-tag.dto'
import { IProjectStatusEvent } from './project-status.interface'

export interface IProjectEvent {
  id: number
  create?: ProjectDto
  update?: IProjectUpdateEvent
  delete?: IEntityDeleteEvent
  task?: ITaskEvent
  folder?: IFolderEvent
  report?: IReportEvent
  sprint?: ISprintEvent
  tags?: {
    add?: CreateTagDto
    delete?: { id: number }
    update?: { id: number; color?: string; name?: string }
  }
  status?: IProjectStatusEvent
}