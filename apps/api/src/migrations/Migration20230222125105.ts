import { Migration } from '@mikro-orm/migrations'

export class Migration20230222125105 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', tableBuilder => {
      tableBuilder.dropColumn('timer_last_start_date')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
    await knex.schema.alterTable('task', tableBuilder => {
      tableBuilder.dateTime('timer_last_start_date')
    })
  }
}
