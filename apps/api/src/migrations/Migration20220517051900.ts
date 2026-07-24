import { Migration } from '@mikro-orm/migrations'

export class Migration20220517051900 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('task', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.string('title').notNullable
			tableBuilder.string('content')
			tableBuilder.dateTime('date_created', { useTz: false }).notNullable()
			tableBuilder.dateTime('date_updated', { useTz: false })
			tableBuilder.dateTime('date_finished', { useTz: false })
			tableBuilder.integer('parent_id').unsigned()
			tableBuilder.integer('user_id').unsigned()
			tableBuilder.integer('assigner_id').unsigned()
			tableBuilder.foreign('user_id').references('user.id').onDelete('SET NULL').withKeyName('fk_task-user-id_user-id')
			tableBuilder
				.foreign('assigner_id')
				.references('user.id')
				.onDelete('CASCADE')
				.withKeyName('fk_task-assigner-id_user-id')
			tableBuilder.foreign('parent_id').references('task.id').onDelete('CASCADE').withKeyName('fk_task-id_parent-id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await this.getKnex().schema.dropTable('task')
	}
}
