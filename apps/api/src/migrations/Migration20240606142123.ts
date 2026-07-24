import { Migration } from '@mikro-orm/migrations'

export class Migration20240606142123 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('task', builder => {
			builder.integer('status_order').unsigned()
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('task', builder => {
			builder.dropColumn('status_order')
		})
	}
}
