import { Migration } from '@mikro-orm/migrations'

export class Migration20221216125836 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dateTime('timer_last_start_date', { useTz: false })
		})

		await knex.schema.createTable('task_timer', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.integer('task_id').notNullable()
			tableBuilder.integer('user_id').notNullable()
			tableBuilder.dateTime('start_time', { useTz: false }).notNullable()
			tableBuilder.dateTime('end_time', { useTz: false })

			tableBuilder.foreign('task_id').references('task.id').onDelete('CASCADE').withKeyName('fk-task_timer-task_id')

			tableBuilder.foreign('user_id').references('user.id').onDelete('CASCADE').withKeyName('fk-task_timer-user_id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dropColumn('timer_last_start_date')
		})

		await knex.schema.alterTable('task_timer', tableBuilder => {
			tableBuilder.dropForeign('task_id', 'fk-task_timer-task_id')
			tableBuilder.dropForeign('user_id', 'fk-task_timer-user_id')
		})

		await knex.schema.dropTable('task_timer')
	}
}
