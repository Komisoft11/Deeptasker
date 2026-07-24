import { Migration } from '@mikro-orm/migrations';

export class Migration20230317114326 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('memberinvitation', builder => {
      builder.dropColumn('team_id')
      builder.integer('project_id')
      builder.foreign('project_id', 'memberinvitation-project_id-project')
        .references('id')
        .inTable('project')
        .onDelete('CASCADE')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('memberinvitation', builder => {
      builder.dropColumn('project_id')
      builder.integer('team_id')
    })
  }

}
