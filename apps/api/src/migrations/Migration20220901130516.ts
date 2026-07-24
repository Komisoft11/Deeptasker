import { Migration } from '@mikro-orm/migrations'

export class Migration20220901130516 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTableIfNotExists('task-plan', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.integer('task_id').notNullable().references('task.id').withKeyName('fk_task-plan-task-id_task-id')
			tableBuilder.date('plan_date').notNullable()
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.dropTableIfExists('task-plan')
	}
}
