import { Migration } from '@mikro-orm/migrations'

export class Migration20220712084842 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('user', tableBuilder => {
			tableBuilder.boolean('is_activated').defaultTo(false)
			tableBuilder.string('activation_link')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('user', tableBuilder => {
			tableBuilder.dropColumn('is_activated')
			tableBuilder.dropColumn('activation_link')
		})
	}
}
