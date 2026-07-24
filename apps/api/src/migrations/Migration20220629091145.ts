import { Migration } from '@mikro-orm/migrations'

export class Migration20220629091145 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.integer('team_id')
			tableBuilder.foreign('team_id').references('team.id').onDelete('SET NULL').withKeyName('fk_task-team-id_team-id')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dropForeign('team_id', 'fk_task-team-id_team-id')
			tableBuilder.dropColumn('team_id')
		})
	}
}
