import { Migration } from '@mikro-orm/migrations';

export class Migration20230912154751 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex('project_order').delete()

    await knex.schema.alterTable('project_order', builder => {
      builder.dropUnique(['project_id', 'user_id', 'parent_id'])
      builder.unique(['project_id', 'user_id'], 'uniq-project_order-project_id-user_id')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
    await knex.schema.alterTable('project_order', builder => {
      builder.dropUnique(['project_id', 'user_id'], 'uniq-project_order-project_id-user_id')
      builder.unique(['project_id', 'user_id', 'parent_id'])
    })
  }

}
