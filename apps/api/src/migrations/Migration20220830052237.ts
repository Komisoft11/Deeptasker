import { Migration } from '@mikro-orm/migrations'

export class Migration20220830052237 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.boolean('is_root').defaultTo(false)
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dropColumn('is_root')
		})
	}
}
