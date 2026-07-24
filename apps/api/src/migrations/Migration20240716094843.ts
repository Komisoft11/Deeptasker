import { Migration } from '@mikro-orm/migrations'

export class Migration20240716094843 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('project', builder => {
			builder.dropForeign('parent_id', 'fk-project-parent_id-project')
			builder.dropForeign('root_id', 'fk-project-root_id-project')
			builder.dropColumn('type')
		})
		await knex.schema.dropTable('project_order')
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('project', builder => {
			builder.integer('parent_id').nullable()
			builder.integer('root_id').nullable()
			builder.string('type').nullable()

			builder
				.foreign('parent_id', 'fk-project-parent_id-project')
				.references('id')
				.inTable('project')
				.onDelete('CASCADE')

			builder
				.foreign('root_id', 'fk-project-root_id-project')
				.references('id')
				.inTable('project')
				.onDelete('CASCADE')
		})

		await knex.schema.createTable('project_order', builder => {
			builder.increments('id', { primaryKey: true })
			builder.integer('project_id').notNullable()
			builder.integer('user_id').notNullable()
			builder.integer('parent_id')
			builder.integer('order').unsigned().notNullable()

			builder
				.foreign('project_id', 'fk-project_order-project_id-project')
				.references('id')
				.inTable('project')
				.onDelete('CASCADE')

			builder
				.foreign('parent_id', 'fk-project_order-parent_id-project')
				.references('id')
				.inTable('project')
				.onDelete('CASCADE')

			builder
				.foreign('user_id', 'fk-project_order-user_id-user')
				.references('id')
				.inTable('user')
				.onDelete('CASCADE')

			builder.unique(['project_id', 'user_id', 'parent_id'])
		})
	}
}