import { Migration } from '@mikro-orm/migrations'

export class Migration20250321095158 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('report', builder => {
			builder.string('title')
		})

		const reportsWithoutTitle = await knex('report').whereNull('title')

		for (const report of reportsWithoutTitle) {
			await knex('report')
				.where('id', report.id)
				.andWhere('uuid', report.uuid)
				.update({
					title: `Report ${report.date_created}`
				})

			console.log(`Set title for report ${report.uuid}`)
		}
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('report', builder => {
			builder.dropColumn('title')
		})
	}
}
