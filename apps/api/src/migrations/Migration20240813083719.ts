import { Migration } from '@mikro-orm/migrations'

export class Migration20240813083719 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('task_history', builder => {
			builder.increments('id', { primaryKey: true })
			builder.integer('task_id').notNullable()
			builder.dateTime('date_created', { useTz: false }).notNullable()
			builder.integer('user_id').notNullable()
			builder.string('field').notNullable()
			builder.string('old_value')
			builder.string('new_value')

			builder
				.foreign('task_id')
				.references('task.id')
				.onDelete('CASCADE')
				.withKeyName('fk_task_history-task_id-task-id')

			builder
				.foreign('user_id')
				.references('user.id')
				.onDelete('CASCADE')
				.withKeyName('fk_task_history-user_id-user-id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.dropTable('task_history')
	}
}
