import { Migration } from '@mikro-orm/migrations'

export class Migration20230317112323 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project', builder => {
      builder.integer('parent_id')
      builder
        .foreign('parent_id', 'fk-project-parent_id-project')
        .references('id')
        .inTable('project')
        .onDelete('SET NULL')
    })

    await knex.schema.createTable('project_user', builder => {
      builder.increments('id', { primaryKey: true })
      builder.integer('project_id').notNullable()
      builder.integer('user_id').notNullable()
      builder.dateTime('date_created', { useTz: false }).notNullable()

      builder
        .foreign('project_id', 'fk-project_user-project_id-project')
        .references('id')
        .inTable('project')
        .onDelete('CASCADE')

      builder
        .foreign('user_id', 'fk-project_user-user_id-user')
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')

      builder.unique(['project_id', 'user_id'], 'uniq-project_user-project_id-user_id')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project', builder => {
      builder.dropColumn('parent_id')
    })

    await knex.schema.dropTable('project_user')
  }
}
