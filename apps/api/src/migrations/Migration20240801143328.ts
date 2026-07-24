import { Migration } from '@mikro-orm/migrations'

export class Migration20240801143328 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('folder', builder => {
			builder.increments('id', { primaryKey: true })
			builder.string('title').notNullable()
			builder.integer('custom_order')
			builder.integer('parent_id').unsigned()
			builder.integer('project_id').unsigned()
			builder.integer('user_id').unsigned()
			builder.dateTime('date_created').notNullable()
			builder.dateTime('date_updated').defaultTo(null)
			builder.dateTime('date_deleted').defaultTo(null)
			builder
				.foreign('parent_id')
				.references('folder.id')
				.onDelete('CASCADE')
				.withKeyName('fk_folder-parent_id-id')
			builder
				.foreign('project_id')
				.references('project.id')
				.onDelete('CASCADE')
				.withKeyName('fk_folder-project_id-project-id')
			builder
				.foreign('user_id')
				.references('user.id')
				.onDelete('CASCADE')
				.withKeyName('fk_folder-user_id-user-id')
		})

		await knex.schema.alterTable('task', builder => {
			builder.integer('folder_id')
			builder
				.foreign('folder_id')
				.references('folder.id')
				.onDelete('CASCADE')
				.withKeyName('fk_task-folder_id-folder-id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', builder => {
			builder.dropColumn('folder_id')
		})

		await knex.schema.dropTable('folder')
	}
}
