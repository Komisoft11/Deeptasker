import { Migration } from '@mikro-orm/migrations'

export class Migration20240520094809 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('task', builder => {
			builder.integer('custom_order').unsigned()
		})

		await knex.schema.alterTable('task_parent', builder => {
			builder.integer('custom_order').unsigned()
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('task', builder => {
			builder.dropColumn('custom_order')
		})

		await knex.schema.alterTable('task_parent', builder => {
			builder.dropColumn('custom_order')
		})
	}
}
