import { Migration } from '@mikro-orm/migrations'

export class Migration20220629114207 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('project', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.string('title').notNullable()
			tableBuilder
				.integer('user_id')
				.unsigned()
				.references('user.id')
				.onDelete('CASCADE')
				.withKeyName('fk_project-user-id_user-id')
			tableBuilder
				.integer('team_id')
				.references('team.id')
				.onDelete('SET NULL')
				.withKeyName('fk_project-team-id_team-id')
			tableBuilder.dateTime('date_created', { useTz: false }).notNullable()
			tableBuilder.dateTime('date_updated', { useTz: false })
			tableBuilder.dateTime('date_deleted', { useTz: false })
		})

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder
				.integer('project_id')
				.references('project.id')
				.onDelete('CASCADE')
				.withKeyName('fk_task-project-id_project-id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dropForeign('project_id', 'fk_task-project-id_project-id')
			tableBuilder.dropColumn('project_id')
		})
		await knex.schema.dropTable('project')
	}
}
