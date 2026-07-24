import { Migration } from '@mikro-orm/migrations'

export class Migration20230815132830 extends Migration {

	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.dropTable('project_role')

		await knex.schema.createTable('workspace_permissions', builder => {
			builder.increments('id', { primaryKey: true })
			builder.integer('workspace_id').notNullable()
			builder.integer('user_id').notNullable()
			builder.boolean('create_projects')
			builder.boolean('delete_projects')
			builder.boolean('edit_projects')
			builder.boolean('manage_admins')
			builder.boolean('edit')
			builder.boolean('delete')

			builder.foreign('workspace_id', 'fk-workspace_permissions-workspace_id-workspace')
				.references('id')
				.inTable('workspace')
				.onDelete('CASCADE')

			builder.foreign('user_id', 'fk-workspace_permissions-user_id-user')
				.references('id')
				.inTable('user')
				.onDelete('CASCADE')

			builder.unique(
				['workspace_id', 'user_id'],
				{ indexName: 'uniq-workspace_permissions-workspace_id-user_id' }
			)
		})

		await knex.schema.createTable('project_permissions', builder => {
			builder.increments('id', { primaryKey: true })
			builder.integer('project_id').notNullable()
			builder.integer('user_id').notNullable()
			builder.boolean('create_subprojects')
			builder.boolean('delete')
			builder.boolean('edit')
			builder.boolean('add_users')
			builder.boolean('remove_users')
			builder.boolean('list_tasks')
			builder.boolean('open_tasks')
			builder.boolean('create_tasks')
			builder.boolean('move_tasks')
			builder.boolean('manage_admins')
			builder.boolean('assigner')
			builder.boolean('controller')

			builder.foreign('project_id', 'fk-project_permissions-project_id-project')
				.references('id')
				.inTable('project')
				.onDelete('CASCADE')

			builder.foreign('user_id', 'fk-project_permissions-user_id-user')
				.references('id')
				.inTable('user')
				.onDelete('CASCADE')

			builder.unique(
				['project_id', 'user_id'],
				{ indexName: 'uniq-project_permissions-project_id-user_id' }
			)
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.dropTable('workspace_permissions')
		await knex.schema.dropTable('project_permissions')
	}

}
