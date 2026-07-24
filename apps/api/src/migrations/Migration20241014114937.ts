import { Migration } from '@mikro-orm/migrations'

export class Migration20241014114937 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('task_comment_reaction', builder => {
			builder.increments('id', { primaryKey: true })
			builder.string('name').notNullable()
			builder.integer('comment_id').notNullable()
			builder.dateTime('date_created', { useTz: false }).notNullable()
			builder.integer('user_id').notNullable()

			builder
				.foreign('comment_id')
				.references('task_comment.id')
				.onDelete('CASCADE')
				.withKeyName('fk-task_comment_reaction-comment_id')

			builder
				.foreign('user_id')
				.references('user.id')
				.onDelete('CASCADE')
				.withKeyName('fk-task_comment_reaction-user_id-user')

			builder.index(
				['comment_id', 'user_id', 'name'],
				'idx-task_comment_reaction-comment_id-user_id-name'
			)
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.dropTable('task_comment_reaction')
	}
}
