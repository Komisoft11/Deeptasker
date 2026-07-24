import { Migration } from '@mikro-orm/migrations'

export class Migration20220629140905 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dateTime('date_deleted', { useTz: false }).after('date_finished')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dropColumn('date_deleted')
		})
	}
}
