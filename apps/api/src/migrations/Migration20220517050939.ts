import { Migration } from '@mikro-orm/migrations'

export class Migration20220517050939 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('user', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.string('password').notNullable()
			tableBuilder.string('username').notNullable().unique()
			tableBuilder.string('email').notNullable().unique()
			tableBuilder.integer('role_id')
			tableBuilder.dateTime('date_created', { useTz: false }).notNullable()
			tableBuilder.dateTime('date_updated', { useTz: false })
			tableBuilder.dateTime('date_deleted', { useTz: false })
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await this.getKnex().schema.dropTable('user')
	}
}
