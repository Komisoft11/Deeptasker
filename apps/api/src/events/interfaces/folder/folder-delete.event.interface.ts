import { IEntityDeleteEvent } from '../entity-delete.event'

export interface IFolderDeleteEvent extends IEntityDeleteEvent {
	projectId: number
}
