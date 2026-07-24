import { Migration } from '@mikro-orm/migrations'

export class Migration20220801104800 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.text('content').alter()
		})
	}

	async down(): Promise<void> {}
}
