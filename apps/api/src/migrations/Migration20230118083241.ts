import { Migration } from '@mikro-orm/migrations'
import { Knex } from '@mikro-orm/postgresql'

export class Migration20230118083241 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await Migration20230118083241.createProjectTeamTable(knex)
	}

	public static async createProjectTeamTable(knex: Knex<any,any>)
	{
		await knex.schema.alterTable('task', tableBuilder => {
			tableBuilder.dropColumn('team_id')
		})

		await knex.schema.createTable('project_team', tableBuilder => {
			tableBuilder.increments('id', { primaryKey: true })
			tableBuilder.integer('project_id').notNullable()
			tableBuilder.integer('team_id').notNullable()
			tableBuilder.integer('created_by')
			tableBuilder.dateTime('date_created', { useTz: false }).notNullable()

			tableBuilder
				.foreign('project_id')
				.references('project.id')
				.onDelete('CASCADE')
				.withKeyName('fk-project_team-project_id')

			tableBuilder
				.foreign('team_id')
				.references('team.id')
				.onDelete('CASCADE')
				.withKeyName('fk-project_team-team_id')

			tableBuilder
				.foreign('created_by')
				.references('user.id')
				.onDelete('SET NULL')
				.withKeyName('fk-project_team-created_by')
		})
	}

	async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', tableBuilder => {
      tableBuilder.integer('team_id')
    })

		await Migration20230118083241.dropProjectTeamTable(knex)
  }

	public static async dropProjectTeamTable(knex: Knex<any,any>) {
		await knex.schema.alterTable('project_team', tableBuilder => {
			tableBuilder.dropForeign('project_id', 'fk-project_team-project_id')
			tableBuilder.dropForeign('team_id', 'fk-project_team-team_id')
			tableBuilder.dropForeign('created_by', 'fk-project_team-created_by')
		})

		await knex.schema.dropTable('project_team')
	}
}
