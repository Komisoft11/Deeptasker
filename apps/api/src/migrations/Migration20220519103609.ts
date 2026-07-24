import { Migration } from '@mikro-orm/migrations'

export class Migration20220519103609 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('user', tableBuilder => {
			tableBuilder.dropColumn('role_id')
			tableBuilder.string('role').after('email').notNullable().defaultTo('user')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('user', tableBuilder => {
			tableBuilder.dropColumn('role')
			tableBuilder.integer('role_id').after('email').notNullable()
		})
	}
}
