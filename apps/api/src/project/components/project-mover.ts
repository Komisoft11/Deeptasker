import { MyBaseModel } from '../../common/database/base.model'
import { ProjectModel } from '../models/project.model'
import { MoveDto } from '../dto/project/in/move.dto'
import { UserModel } from '../../user/models/user.model'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Transaction } from '@mikro-orm/core'

@Injectable()
export class ProjectMover {
	public async move(project: ProjectModel, moveDto: MoveDto, user: UserModel) {
		if (moveDto.order < 1) {
			throw new BadRequestException('Bad newOrder: ' + moveDto.order)
		}

		const trx = await MyBaseModel.startTransaction()

		try {
			await this.reorder(project, moveDto.order, trx)
			await trx.commit()
		} catch (e) {
			console.error(e)
			await trx.rollback()
			throw e
		}
	}

	private async reorder(project: ProjectModel, newOrder: number, trx: Transaction) {
		const oldOrder: number = project.order

		await project.$query(trx).patch({ order: newOrder })

		if (oldOrder < newOrder) {
			await ProjectModel.query(trx)
				.whereNot('id', project.id)
				.andWhere('workspaceId', project.workspaceId)
				.andWhere('dateDeleted', null)
				.andWhere('order', '>', oldOrder)
				.andWhere('order', '<=', newOrder)
				.decrement('order', 1)
		} else {
			await ProjectModel.query(trx)
				.whereNot('id', project.id)
				.andWhere('workspaceId', project.workspaceId)
				.andWhere('dateDeleted', null)
				.andWhere('order', '>=', newOrder)
				.andWhere('order', '<', oldOrder)
				.increment('order', 1)
		}
	}

	public async upOrderTop(project: ProjectModel, trx?: Transaction) {
		await ProjectModel.query(trx)
			.whereNot('id', project.id)
			.andWhere('workspaceId', project.workspaceId)
			.increment('order', 1)
	}
}
