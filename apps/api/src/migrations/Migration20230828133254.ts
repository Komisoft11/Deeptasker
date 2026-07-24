import { Migration } from '@mikro-orm/migrations'

export class Migration20230828133254 extends Migration {

	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task_timer_history', builder => {
			builder.dateTime('edited_date', { useTz: false })
			builder.string('comment')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task_timer_history', builder => {
			builder.dropColumn('edited_date')
			builder.dropColumn('comment')
		})
	}

}
