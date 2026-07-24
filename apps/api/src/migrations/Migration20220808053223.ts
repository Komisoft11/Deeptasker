import { Migration } from '@mikro-orm/migrations'

export class Migration20220808053223 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('file', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.string('file_path').notNullable()
			tableBuilder.dateTime('date_created', { useTz: false }).notNullable()
		})

		await knex.schema.createTable('task-file', tableBuilder => {
			tableBuilder
				.integer('task_id')
				.notNullable()
				.references('task.id')
				.onDelete('CASCADE')
				.withKeyName('fk_task-file-task-id_task-id')
			tableBuilder
				.integer('file_id')
				.notNullable()
				.references('file.id')
				.onDelete('CASCADE')
				.withKeyName('fk_task-file-file-id_file-id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.dropTable('task-file')
		await knex.schema.dropTable('file')
	}
}
