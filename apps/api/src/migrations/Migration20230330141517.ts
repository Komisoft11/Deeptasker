import { Migration } from '@mikro-orm/migrations'
import { Knex } from '@mikro-orm/postgresql'

export class Migration20230330141517 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('project', builder => {
			builder.integer('root_id')
			builder
				.foreign('root_id', 'fk-project-root_id-project')
				.references('id')
				.inTable('project')
				.onDelete('SET NULL')
		})

		await this.setRootIdForProjects(knex)
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('project', builder => {
			builder.dropColumn('root_id')
		})
	}

	private async setRootIdForProjects(knex: Knex<any, any[]>) {
		const projectIdsWithParent = await knex('project')
			.select('id')
			.whereNot('parent_id', null)
			.pluck('id')

		const findRoot = async (projectId: number): Promise<number> => {
			const root: { parent_id: number; id: number } = await knex('project')
				.select(['parent_id', 'id'])
				.where('id', projectId)
				.first()

			if (!root.parent_id) {
				return root.id
			}

			return await findRoot(root.parent_id)
		}

		console.log('setting root for projects with parent')

		await Promise.all(
			projectIdsWithParent.map(id => {
				return (async projectId => {
					const rootId = await findRoot(projectId)
					console.log('rootId: ', rootId)
					return knex('project')
						.update({
							root_id: rootId
						})
						.where('id', projectId)
				})(id)
			})
		)

		console.log('done')
	}
}
