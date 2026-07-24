import { Migration } from '@mikro-orm/migrations'

export class Migration20240626143300 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('notification', builder => {
			builder.increments('id', { primaryKey: true })
			builder.uuid('uuid').notNullable()
      builder.dateTime('date_created', { useTz: false }).notNullable()
			builder.integer('user_id').notNullable()
      builder.dateTime('date_read', { useTz: false })
      builder.text('content').notNullable()

			builder.foreign('user_id', 'fk-notification-user_id-user-id').references('user.id').onDelete('CASCADE')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.dropTable('notification')
	}
}
