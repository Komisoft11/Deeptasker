import { Migration } from '@mikro-orm/migrations'

export class Migration20220822114217 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dropColumns('parent_id')
		})

		await knex.schema.createTableIfNotExists('task-parent', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.integer('task_id').notNullable().references('task.id').withKeyName('fk_task-parent-task-id_task-id')
			tableBuilder
				.integer('parent_id')
				.nullable()
				.references('task.id')
				.withKeyName('fk_task-parent-parent-id_parent-id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.integer('parent_id')
		})

		await knex.schema.dropTableIfExists('task-parent')
	}
}
