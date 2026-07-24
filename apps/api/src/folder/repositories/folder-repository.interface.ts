import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'

import { TransactionOrKnex } from 'objection'
import { FolderModel } from '../model/folder.model'
import { CreateFolderDto } from '../dto/in/create-folder.dto'
import { UserModel } from '../../user/models/user.model'
import { UpdateFolderDto } from '../dto/in/update-folder.dto'

export const FOLDER_REPOSITORY = 'folder_repository'

export interface IFolderRepository extends RepositoryContract<FolderModel> {
	query<R = FolderModel>(): CustomQueryBuilder<FolderModel, R>

	createFolder(
		createDto: CreateFolderDto,
		user: UserModel,
		trx?: TransactionOrKnex
	): Promise<FolderModel>

	getFolder(folderId: number, trx?: TransactionOrKnex): Promise<FolderModel>

	updateFolder(folderId: number, updateDto: UpdateFolderDto, trx?: TransactionOrKnex): Promise<void>

	deleteFolder(folderId: number, trx?: TransactionOrKnex): Promise<void>

	deleteChildren(folderId: number, trx?: TransactionOrKnex): Promise<void>

	getFolders(projectId: number, trx?: TransactionOrKnex): Promise<FolderModel[]>

	changeProject(folder: FolderModel, projectId: number, trx?: TransactionOrKnex): Promise<void>

	isTitleExists(title: string, projectId: number, parentId?: number): Promise<boolean>
}
