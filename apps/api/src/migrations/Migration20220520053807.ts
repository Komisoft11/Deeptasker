import { Migration } from '@mikro-orm/migrations'

export class Migration20220520053807 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dropForeign('parent_id', 'fk_task-id_parent-id')
		})
	}
}
