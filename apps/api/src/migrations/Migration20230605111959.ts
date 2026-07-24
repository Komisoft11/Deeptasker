import { Migration } from '@mikro-orm/migrations'

export class Migration20230605111959 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', builder => {
      builder.integer('active_task_id')

      builder.foreign('active_task_id').references('id').inTable('task').onDelete('SET NULL')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', b => {
      b.dropColumn('active_task_id')
    })
  }
}
