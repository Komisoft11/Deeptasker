import { Migration } from '@mikro-orm/migrations';

export class Migration20230310151309 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('team_project', builder => {
      builder.increments('id', { primaryKey: true })

      builder
        .integer('team_id')
        .references('team.id')
        .withKeyName('fk_team_project-team_id')
        .onDelete('CASCADE')
        .notNullable()

      builder
        .integer('project_id')
        .references('project.id')
        .withKeyName('fk_team_project-project_id')
        .onDelete('CASCADE')
        .notNullable()

      builder.dateTime('date_created', { useTz: false }).notNullable()

      builder
        .integer('added_by')
        .references('user.id')
        .withKeyName('fk_team_project-added_by')
        .onDelete('SET NULL')

      builder.unique(['team_id', 'project_id'], 'uniq-team_project-team_id-project_id')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('team_project', builder => {
      builder.dropForeign('added_by', 'fk_team_project-added_by')
      builder.dropForeign('project_id', 'fk_team_project-project_id')
      builder.dropForeign('team_id', 'fk_team_project-team_id')
      builder.dropUnique(['team_id', 'project_id'], 'uniq-team_project-team_id-project_id')
    })
    
    await knex.schema.dropTable('team_project')
  }

}
