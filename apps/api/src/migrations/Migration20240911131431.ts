import { Migration } from '@mikro-orm/migrations'

export class Migration20240911131431 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', builder => {
			builder.integer('parent_id')
			builder.foreign('parent_id', 'fk-parent_id-task-task-id').references('id').inTable('task')
		})

		const taskParents: { task_id: number; parent_id: number; custom_order: number }[] = await knex(
			'task_parent'
		)

		for (const taskParent of taskParents) {
			await knex('task')
				.update({
					parent_id: taskParent.parent_id,
					custom_order: taskParent.custom_order
				})
				.where('id', taskParent.task_id)
		}

		await knex.schema.dropTable('task_parent')
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', builder => {
			builder.dropForeign('parent_id', 'fk-parent_id-task-task-id')
			builder.dropColumn('parent_id')
		})

		await knex.schema.createTable('task_parent', builder => {
			builder.increments('id', { primaryKey: true })
			builder.integer('task_id').references('task.id').notNullable()
			builder.integer('parent_id').references('task.id').notNullable()
			builder.integer('custom_order')
		})
	}
}
