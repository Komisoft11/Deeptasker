import { Migration } from '@mikro-orm/migrations'

export class Migration20230329120558 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.dropColumn('is_root')
      builder.integer('executor_id')

      builder
        .foreign('executor_id', 'fk-task-executor_id-user')
        .references('id')
        .inTable('user')
        .onDelete('SET NULL')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.boolean('is_root').defaultTo(false)
      builder.dropColumn('executor_id')
    })
  }
}
