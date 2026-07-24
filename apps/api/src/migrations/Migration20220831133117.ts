import { Migration } from '@mikro-orm/migrations'

export class Migration20220831133117 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('project', tableBuilder => {
			tableBuilder.string('slug')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('project', tableBuilder => {
			tableBuilder.dropColumn('slug')
		})
	}
}
