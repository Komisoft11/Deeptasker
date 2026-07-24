import { Migration } from '@mikro-orm/migrations'

export class Migration20241118122702 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('notification', builder => {
			builder.dateTime('date_deleted', { useTz: false })
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('notification', builder => {
			builder.dropColumn('date_deleted')
		})
	}
}
