import { Migration } from '@mikro-orm/migrations'

export class Migration20221024210359 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.renameTable('task-plan', 'task_plan')
		await knex.schema.renameTable('task-comment', 'task_comment')
		await knex.schema.renameTable('task-file', 'task_file')
		await knex.schema.renameTable('task-parent', 'task_parent')
		this.addSql('ALTER TABLE task_plan ALTER COLUMN plan_date TYPE DATE')
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('plan_task', tableBuilder => {
			tableBuilder.datetime('plan_date')
		})
		await knex.schema.renameTable('task_plan', 'task-plan')
		await knex.schema.renameTable('task_comment', 'task-comment')
		await knex.schema.renameTable('task_file', 'task-file')
		await knex.schema.renameTable('task_parent', 'task-parent')
	}
}
