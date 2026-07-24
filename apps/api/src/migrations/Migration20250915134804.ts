import { Migration } from '@mikro-orm/migrations'

export class Migration20250915134804 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.dateTime('deadline_date', { useTz: true }).alter()
      builder.dateTime('date_created', { useTz: true }).alter()
      builder.dateTime('date_updated', { useTz: true }).alter()
      builder.dateTime('date_finished', { useTz: true }).alter()
      builder.dateTime('date_deleted', { useTz: true }).alter()
      builder.dateTime('status_date_updated', { useTz: true }).alter()
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.dateTime('deadline_date', { useTz: false }).alter()
      builder.dateTime('date_created', { useTz: false }).alter()
      builder.dateTime('date_updated', { useTz: false }).alter()
      builder.dateTime('date_finished', { useTz: false }).alter()
      builder.dateTime('date_deleted', { useTz: false }).alter()
      builder.dateTime('status_date_updated', { useTz: false }).alter()
    })
  }
}
