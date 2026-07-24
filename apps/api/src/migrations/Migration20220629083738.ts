import { Migration } from '@mikro-orm/migrations'

export class Migration20220629083738 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('team', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.string('title').notNullable
			tableBuilder.integer('user_id').unsigned()
			tableBuilder.dateTime('date_created', { useTz: false }).notNullable()
			tableBuilder.dateTime('date_updated', { useTz: false })
			tableBuilder.dateTime('date_deleted', { useTz: false })
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await this.getKnex().schema.dropTable('team')
	}
}
