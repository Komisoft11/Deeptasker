import { Migration } from '@mikro-orm/migrations'

export class Migration20241021131915 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task_comment', builder => {
			builder.integer('reply_id')

			builder
				.foreign('reply_id', 'fk-task_comment-reply_id-task_comment')
				.references('task_comment.id')
				.onDelete('SET NULL')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task_comment', builder => {
			builder.dropColumn('reply_id')
		})
	}
}
