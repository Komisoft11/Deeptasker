import { Migration } from '@mikro-orm/migrations'

export class Migration20241209090611 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('user', table => {
			table.string('username').nullable().alter()
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('user', table => {
			table.string('username').notNullable().alter()
		})
	}
}
