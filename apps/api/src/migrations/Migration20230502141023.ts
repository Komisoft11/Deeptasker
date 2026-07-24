import { Migration } from '@mikro-orm/migrations';

export class Migration20230502141023 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('project_order', builder => {
      builder.increments('id', { primaryKey: true })
      builder.integer('project_id').notNullable()
      builder.integer('user_id').notNullable()
      builder.integer('parent_id')
      builder.integer('order').unsigned().notNullable()

      builder
        .foreign('project_id', 'fk-project_order-project_id-project')
        .references('id')
        .inTable('project')
        .onDelete('CASCADE')

      builder
        .foreign('parent_id', 'fk-project_order-parent_id-project')
        .references('id')
        .inTable('project')
        .onDelete('CASCADE')

      builder
        .foreign('user_id', 'fk-project_order-user_id-user')
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')

      builder.unique(['project_id', 'user_id', 'parent_id'])
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('project_order')
  }
}
