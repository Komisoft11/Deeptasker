import { Migration } from '@mikro-orm/migrations'

export class Migration20220714051630 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('memberinvitation', tableBuilder => {
			tableBuilder.dateTime('date_created')
			tableBuilder.dateTime('date_updated')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('memberinvitation', tableBuilder => {
			tableBuilder.dropColumn('date_created')
			tableBuilder.dropColumn('date_updated')
		})
	}
}
