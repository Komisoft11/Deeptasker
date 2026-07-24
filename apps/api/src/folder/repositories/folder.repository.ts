import { InjectModel } from '@squareboat/nestjs-objection'
import { Injectable } from '@nestjs/common'
import { Repository } from '../../common/database/repository'
import { FolderModel } from '../model/folder.model'
import { IFolderRepository } from './folder-repository.interface'
import { TransactionOrKnex } from 'objection'
import { CreateFolderDto } from '../dto/in/create-folder.dto'
import { UserModel } from '../../user/models/user.model'
import { UpdateFolderDto } from '../dto/in/update-folder.dto'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { DataBaseException } from '../../exceptions/DataBaseException'
import { TaskModel } from '../../task/models/task.model'
import { ProjectModel } from '../../project/models/project.model'

@Injectable()
export class FolderRepository extends Repository<FolderModel> implements IFolderRepository {
	@InjectModel(FolderModel)
	model: FolderModel

	public async createFolder(
		createDto: CreateFolderDto,
		user: UserModel,
		trx?: TransactionOrKnex
	): Promise<FolderModel> {
		try {
			return createDto.parentId
				? FolderModel.query(trx).insert({
						title: createDto.title,
						projectId: createDto.projectId,
						parentId: createDto.parentId,
						userId: user.id
				  })
				: FolderModel.query(trx).insert({
						title: createDto.title,
						projectId: createDto.projectId,
						userId: user.id
				  })
		} catch (e) {
			throw new DataBaseException(e)
		}
	}

	public async getFolder(folderId: number, trx?: TransactionOrKnex): Promise<FolderModel> {
		try {
			return await FolderModel.query(trx).findById(folderId)
		} catch (e) {
			throw new DataBaseException(e)
		}
	}

	public async updateFolder(
		folderId: number,
		updateDto: UpdateFolderDto,
		trx?: TransactionOrKnex
	): Promise<void> {
		try {
			await FolderModel.query(trx)
				.findById(folderId)
				.patch({
					title: updateDto.title
				})
				.where('dateDeleted', null)
		} catch (e) {
			throw new DataBaseException(e)
		}
	}

	public async deleteFolder(folderId: number, trx?: TransactionOrKnex): Promise<void> {
		try {
			await FolderModel.query(trx).findById(folderId).patch({
				dateDeleted: getCurrentUTCDateTime()
			})

			await TaskModel.query(trx)
				.patch({
					dateDeleted: getCurrentUTCDateTime()
				})
				.where('folderId', folderId)
				.andWhere('dateDeleted', null)
		} catch (e) {
			throw new DataBaseException(e)
		}
	}

	public async getFolders(projectId: number, trx?: TransactionOrKnex): Promise<FolderModel[]> {
		try {
			const folders = await FolderModel.query(trx)
				.where('dateDeleted', null)
				.andWhere('projectId', projectId)
				.withGraphJoined(
					'[user(selectShort), tasks(selectId,notDeleted), subFolders(selectShort,notDeleted)]'
				)

			return folders
		} catch (e) {
			throw new DataBaseException(e)
		}
	}

	public async changeProject(
		folder: FolderModel,
		projectId: number,
		trx?: TransactionOrKnex
	): Promise<void> {
		try {
			const countFoldersInNewProject: number = await FolderModel.query(trx)
				.where('dateDeleted', null)
				.andWhere('projectId', projectId)
				.onlyCount()

			await folder.$query(trx).patch({
				projectId: projectId
			})
		} catch (e) {
			throw new DataBaseException(e)
		}
	}

	public async deleteFolderFromParent(folder: FolderModel, trx?: TransactionOrKnex): Promise<void> {
		try {
			await folder.$query(trx).patch({
				parentId: null
			})
		} catch (e) {
			throw new DataBaseException(e)
		}
	}

	public async addFolderToParent(
		folder: FolderModel,
		parentId: number,
		trx?: TransactionOrKnex
	): Promise<void> {
		try {
			await folder.$query(trx).patch({
				parentId: parentId
			})
		} catch (e) {
			throw new DataBaseException(e)
		}
	}

	public async deleteChildren(folderId: number, trx?: TransactionOrKnex): Promise<void> {
		try {
			const subFolderIds = (
				await FolderModel.query(trx)
					.select('id')
					.where('parentId', folderId)
					.andWhere('dateDeleted', null)
			).map(t => t.id)

			if (subFolderIds.length === 0) {
				return
			}

			await FolderModel.query(trx)
				.patch({
					dateDeleted: getCurrentUTCDateTime()
				})
				.whereIn('id', subFolderIds)

			await TaskModel.query(trx)
				.patch({
					dateDeleted: getCurrentUTCDateTime()
				})
				.whereIn('folderId', subFolderIds)
				.andWhere('dateDeleted', null)

			for (const subFolderId of subFolderIds) {
				await Promise.all([this.deleteChildren(subFolderId, trx)])
			}
		} catch (e) {
			throw new DataBaseException(e)
		}
	}

	public async isTitleExists(
		title: string,
		projectId: number,
		parentId?: number
	): Promise<boolean> {
		try {
			return FolderModel.query()
				.where('title', title)
				.andWhere('projectId', projectId)
				.andWhere('parentId', parentId ?? null)
				.andWhere('dateDeleted', null)
				.exists()
		} catch (e) {
			throw new DataBaseException(e)
		}
	}
}
