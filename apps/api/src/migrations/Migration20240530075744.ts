import { Migration } from '@mikro-orm/migrations'

export class Migration20240530075744 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('project', builder => {
			builder.integer('order').unsigned()
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.alterTable('project', builder => {
			builder.dropColumn('order')
		})
	}
}
