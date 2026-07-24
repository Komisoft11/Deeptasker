import { Migration } from '@mikro-orm/migrations'

export class Migration20250506124738 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_status', builder => {
      builder.dateTime('date_deleted', { useTz: false }).nullable()
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_status', builder => {
      builder.dropColumn('date_deleted')
    })
  }
}
