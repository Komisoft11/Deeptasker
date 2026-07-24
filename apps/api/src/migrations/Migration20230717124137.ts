import { Migration } from '@mikro-orm/migrations';

export class Migration20230717124137 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project_user', builder => {
      builder.dropChecks('project_user_access_check')
    })

    await knex.schema.alterTable('project_user', builder => {
      builder.enum('access', ['full', 'partial', 'admin']).defaultTo('full').notNullable().alter()
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project_user', builder => {
      builder.dropChecks('project_user_access_check')
    })

    await knex.schema.alterTable('project_user', builder => {
      builder.enum('access', ['full', 'partial']).defaultTo('full').notNullable().alter()
    })
  }

}
