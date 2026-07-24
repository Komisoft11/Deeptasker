import { Migration } from '@mikro-orm/migrations';

export class Migration20230208111259 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.datetime('active_date')
		})
	}

	async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', tableBuilder => {
      tableBuilder.dropColumn('active_date')
    })
	}
}
