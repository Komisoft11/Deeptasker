import { Migration } from '@mikro-orm/migrations'

export class Migration20230317111441 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project', builder => {
      builder.dropColumn('team_id')
    })

    await knex.schema.dropTable('team_role')
    await knex.schema.dropTable('team_project')
    await knex.schema.dropTable('userteam')
    await knex.schema.dropTable('team')
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project', builder => {
      builder.integer('team_id')
    })

    await knex.schema.createTable('team_role', b => {})
    await knex.schema.createTable('team_project', b => {})
    await knex.schema.createTable('userteam', b => {})
    await knex.schema.createTable('team', b => {})
  }
}
