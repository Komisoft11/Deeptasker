import { Migration } from '@mikro-orm/migrations'

export class Migration20240629131304 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('project', builder => {
			builder.enum('type', ['project', 'container']).defaultTo('project')
			builder.dateTime('date_archived').defaultTo(null)
		})

		await knex('project').update({
			type: 'project'
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('project', builder => {
			builder.dropColumn('type')
			builder.dropColumn('date_archived')
		})
	}
}
