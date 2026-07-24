import { FolderDto } from '../../../folder/dto/out/folder.dto'
import { IFolderUpdateEvent } from './folder-update.event.interface'
import { IFolderDeleteEvent } from './folder-delete.event.interface'
import { CreateFolderDto } from '../../../folder/dto/in/create-folder.dto'
import { IFolderCreateEvent } from './folder-create.interface'

export interface IFolderEvent {
	id: number
	create?: IFolderCreateEvent
	update?: IFolderUpdateEvent
	delete?: IFolderDeleteEvent
}