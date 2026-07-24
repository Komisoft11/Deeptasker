import { MyBaseModel } from './base.model'
import { DatabaseRepository, ModelKeys } from '@squareboat/nestjs-objection'

export class Repository<T extends MyBaseModel> extends DatabaseRepository<T> {
	async exists(params: T): Promise<boolean> {
		const query = this.query()
		query.where(params)
		return !!(await query.limit(1).onlyCount())
	}

	async update(model: T, setValues: ModelKeys<T>): Promise<number | null> {
		const query = this.query<number>()
		const numUpdated = model.id ? await query.patch(setValues).where({ id: model.id }) : 0
		if (numUpdated > 0) {
			Object.assign(model, setValues)
		}

		return numUpdated
	}
}
