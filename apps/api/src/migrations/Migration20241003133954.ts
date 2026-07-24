import { Migration } from '@mikro-orm/migrations'

export class Migration20241003133954 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', builder => {
			builder.dateTime('plan_start_date', { useTz: false })
			builder.integer('estimated_time').unsigned()
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', builder => {
			builder.dropColumn('plan_start_date')
			builder.dropColumn('estimated_time')
		})
	}
}
