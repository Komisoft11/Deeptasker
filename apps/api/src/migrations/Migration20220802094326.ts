import { Migration } from '@mikro-orm/migrations'

export class Migration20220802094326 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('task-comment', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder
				.integer('task_id')
				.notNullable()
				.references('task.id')
				.onDelete('SET NULL')
				.withKeyName('fk_task-comment-task-id_task-id')
			tableBuilder
				.integer('user_id')
				.notNullable()
				.references('user.id')
				.onDelete('SET NULL')
				.withKeyName('fk_task-comment-user-id_user-id')
			tableBuilder.text('comment').notNullable()
			tableBuilder.dateTime('date_created', { useTz: false }).notNullable()
			tableBuilder.dateTime('date_updated', { useTz: false })
			tableBuilder.dateTime('date_deleted', { useTz: false })
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.dropTable('task-comment')
	}
}
