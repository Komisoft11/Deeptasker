import { Migration } from '@mikro-orm/migrations';
import { Knex } from '@mikro-orm/postgresql'

export class Migration20230310140939 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await this.createProjectRoleTable(knex)
    await this.createTeamRoleTable(knex)
    await Migration20230310140939.createTaskRoleTable(knex)
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await this.dropProjectRoleTable(knex)
    await this.dropTeamRoleTable(knex)
    await this.dropTaskRoleTable(knex)
  }

  private async createProjectRoleTable(knex: Knex<any, any[]>) {
    await knex.schema.createTable('project_role', builder => {
      builder.increments('id', { primaryKey: true })
      builder
        .integer('user_id')
        .references('user.id')
        .withKeyName('fk_project_role-user_id')
        .onDelete('CASCADE')
        .notNullable()

      builder
        .integer('project_id')
        .references('project.id')
        .withKeyName('fk_project_role-project_id')
        .onDelete('CASCADE')
        .notNullable()

      builder.string('role').notNullable()

      builder.unique(
        ['user_id', 'project_id', 'role'],
        'uniq-project_role-user_id-project_id-role',
      )
    })
  }

  private async createTeamRoleTable(knex: Knex<any, any[]>) {
    await knex.schema.createTable('team_role', builder => {
      builder.increments('id', { primaryKey: true })
      builder
        .integer('user_id')
        .references('user.id')
        .withKeyName('fk_team_role-user_id')
        .onDelete('CASCADE')
        .notNullable()

      builder
        .integer('team_id')
        .references('team.id')
        .withKeyName('fk_team_role-team_id')
        .onDelete('CASCADE')
        .notNullable()

      !builder.string('role').notNullable()

      builder.unique(
        ['user_id', 'team_id', 'role'],
        'uniq-team_role-user_id-team_id-role'
      )
    })
  }

  public static async createTaskRoleTable(knex: Knex<any, any[]>) {
    await knex.schema.createTable('task_role', builder => {
      builder.increments('id', { primaryKey: true })
      builder
        .integer('user_id')
        .references('user.id')
        .withKeyName('fk_task_role-user_id')
        .onDelete('CASCADE')
        .notNullable()

      builder
        .integer('task_id')
        .references('task.id')
        .withKeyName('fk_task_role-task_id')
        .onDelete('CASCADE')
        .notNullable()

      builder.string('role').notNullable()

      builder.unique(
        ['user_id', 'task_id', 'role'],
        'uniq-task_role-user_id-team_id-role'
      )
    })
  }

  private async dropProjectRoleTable(knex: Knex<any, any[]>) {
    await knex.schema.alterTable('project_role', builder => {
      builder.dropForeign('user_id', 'fk_project_role-user_id')
      builder.dropForeign('project_id', 'fk_project_role-project_id')
      builder.dropUnique(['user_id', 'project_id', 'role'], 'uniq-project_role-user_id-project_id-role')
    })

    await knex.schema.dropTable('project_role')
  }

  private async dropTeamRoleTable(knex: Knex<any, any[]>) {
    await knex.schema.alterTable('team_role', builder => {
      builder.dropForeign('user_id', 'fk_team_role-user_id')
      builder.dropForeign('team_id', 'fk_team_role-team_id')
      builder.dropUnique(['user_id', 'team_id', 'role'], 'uniq-team_role-user_id-team_id-role')
    })

    await knex.schema.dropTable('team_role')
  }

  private async dropTaskRoleTable(knex: Knex<any, any[]>) {
    await knex.schema.alterTable('task_role', builder => {
      builder.dropForeign('user_id', 'fk_task_role-user_id')
      builder.dropForeign('task_id', 'fk_task_role-task_id')
      builder.dropUnique(['user_id', 'task_id', 'role'], 'uniq-task_role-user_id-team_id-role')
    })

    await knex.schema.dropTable('task_role')
  }

}
