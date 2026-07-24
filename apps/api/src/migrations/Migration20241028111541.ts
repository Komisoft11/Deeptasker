import { Migration } from '@mikro-orm/migrations'

export class Migration20241028111541 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('file', builder => {
			builder.integer('size').unsigned()
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('file', builder => {
			builder.dropColumn('size')
		})
	}
}
