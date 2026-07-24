import { Migration } from '@mikro-orm/migrations'

export class Migration20241018122031 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('task_comment_file', builder => {
			builder.increments('id', { primaryKey: true })
			builder.integer('comment_id').notNullable()
			builder.integer('file_id').notNullable()
			builder.integer('user_id').notNullable()

			builder
				.foreign('comment_id')
				.references('task_comment.id')
				.onDelete('CASCADE')
				.withKeyName('fk-task_comment_file-comment_id')

			builder
				.foreign('file_id')
				.references('file.id')
				.onDelete('CASCADE')
				.withKeyName('fk-task_comment_file-file_id')

			builder
				.foreign('user_id')
				.references('user.id')
				.onDelete('CASCADE')
				.withKeyName('fk-task_comment_file-user_id-user')

			builder.index(['comment_id'], 'idx-task_comment_file-comment_id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.dropTable('task_comment_file')
	}
}
