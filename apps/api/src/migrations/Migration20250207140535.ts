import { Migration } from '@mikro-orm/migrations'

export class Migration20250207140535 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('user', builder => {
			builder.dropColumn('activation_link')
			builder.dropColumn('password_reset_code')
		})

		await knex.schema.createTable('verification', builder => {
			builder.increments('id', { primaryKey: true })
			builder.string('code').notNullable()
			builder.dateTime('date_created', { useTz: false }).notNullable()
			builder.dateTime('date_expire', { useTz: false }).notNullable()
			builder.integer('user_id').notNullable()
			builder.enum('type', ['registration', 'password_reset']).notNullable()

			builder
				.foreign('user_id', 'fk-notification-user_id-user-id')
				.references('user.id')
				.onDelete('CASCADE')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.dropTable('verification')

		await knex.schema.alterTable('user', builder => {
			builder.string('activation_link')
			builder.uuid('password_reset_code').unique()
		})
	}
}
