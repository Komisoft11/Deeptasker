import { Migration } from '@mikro-orm/migrations'

export class Migration20220713080720 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('memberinvitation', tableBuilder => {
			tableBuilder.integer('team_id').notNullable()
			tableBuilder.string('email').notNullable()
			tableBuilder.boolean('is_accepted').defaultTo(false)
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.dropTable('memberinvitation')
	}
}
