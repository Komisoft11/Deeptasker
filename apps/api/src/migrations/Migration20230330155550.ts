import { Migration } from '@mikro-orm/migrations';

export class Migration20230330155550 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project_user', builder => {
      builder.enum('access', ['full', 'partial']).defaultTo('full').notNullable()
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project_user', builder => {
      builder.dropColumn('access')
    })
  }
}
