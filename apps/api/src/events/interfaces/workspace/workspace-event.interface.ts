import { WorkspaceDto } from '../../../workspace/dto/out/workspace.dto'
import { IEntityDeleteEvent } from '../entity-delete.event'
import { IWorkspaceUpdateEvent } from './workspace-update.event'
import { IProjectEvent } from '../project/project-event.interface'

export interface IWorkspaceEvent {
	id: number
	create?: WorkspaceDto,
	update?: IWorkspaceUpdateEvent
	delete?: IEntityDeleteEvent,
	project?: IProjectEvent
}