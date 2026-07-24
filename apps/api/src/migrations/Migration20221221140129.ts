import { Migration } from '@mikro-orm/migrations'

export class Migration20221221140129 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('user', tableBuilder => {
			tableBuilder.string('first_name')
			tableBuilder.string('last_name')
		})

		await knex('user').update({
			first_name: knex.ref('username'),
			last_name: knex.ref('username')
		})

		await knex.schema.alterTable('user', tableBuilder => {
			tableBuilder.string('first_name').notNullable().alter()
			tableBuilder.string('last_name').notNullable().alter()
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('user', tableBuilder => {
			tableBuilder.dropColumn('first_name')
			tableBuilder.dropColumn('last_name')
		})
	}
}
