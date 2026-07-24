import { Migration } from '@mikro-orm/migrations'

export class Migration20240708080640 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', builder => {
			builder.dateTime('date_sent_for_review').defaultTo(null)
		})

		await knex.schema.createTable('project_settings', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.integer('project_id')
			tableBuilder.boolean('is_review_required').defaultTo(false)
			tableBuilder
				.foreign('project_id')
				.references('project.id')
				.onDelete('CASCADE')
				.withKeyName('fk_project_settings-project_id-project-id')
		})

		const projects: any[] = await knex('project').select('id').whereNull('date_deleted')

		for (const project of projects) {
			await knex('project_settings').insert({
				project_id: project.id,
				is_review_required: false
			})
		}

		console.log(`Added ${projects.length} rows in table.project_settings`)
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('task', builder => {
			builder.dropColumn('date_sent_for_review')
		})

		await knex.schema.dropTable('project_settings')
	}
}
