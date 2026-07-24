import { Migration } from '@mikro-orm/migrations'
import dayjs from 'dayjs'

export class Migration20250404081325 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('report', builder => {
			builder
				.dateTime('period_start', { useTz: false })
				.notNullable()
				.defaultTo(dayjs().toISOString())
			builder
				.dateTime('period_end', { useTz: false })
				.notNullable()
				.defaultTo(dayjs().toISOString())
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('report', builder => {
			builder.dropColumn('period_start')
			builder.dropColumn('period_end')
		})
	}
}
