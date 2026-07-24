import { Migration } from '@mikro-orm/migrations'

export class Migration20220519013830 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('refresh', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.string('token').notNullable().unique()
			tableBuilder.integer('user_id').notNullable()
			tableBuilder.dateTime('date_created', { useTz: false }).notNullable()
			tableBuilder.dateTime('date_expire', { useTz: false }).notNullable()

			tableBuilder
				.foreign('user_id')
				.references('user.id')
				.onDelete('CASCADE')
				.withKeyName('fk_refresh-user_id-user-id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('refresh', tableBuilder => {
			tableBuilder.dropForeign('user_id', 'fk_refresh-user_id-user-id')
		})

		await knex.schema.dropTable('user')
	}
}
