import { Migration } from '@mikro-orm/migrations'

export class Migration20230313124650 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.dateTime('deadline_date', { useTz: false })
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.dropColumn('deadline_date')
    })
  }
}
