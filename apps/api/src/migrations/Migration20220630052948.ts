import { Migration } from '@mikro-orm/migrations'

export class Migration20220630052948 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('userteam', tableBuilder => {
			tableBuilder
				.integer('team_id')
				.notNullable()
				.references('team.id')
				.onDelete('SET NULL')
				.withKeyName('fk_userteam-team-id_team-id')
			tableBuilder
				.integer('member_id')
				.notNullable()
				.references('user.id')
				.onDelete('SET NULL')
				.withKeyName('fk_userteam-member-id_user-id')
			tableBuilder.primary(['team_id', 'member_id'])
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
		await knex.schema.dropTable('userteam')
	}
}
