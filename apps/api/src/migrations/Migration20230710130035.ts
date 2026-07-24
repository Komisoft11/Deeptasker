import { Migration } from '@mikro-orm/migrations'

export class Migration20230710130035 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('task_plan_day', builder => {
      builder.increments('id', { primaryKey: true })
      builder.integer('task_id').notNullable()
      builder.date('day').notNullable()
      builder.dateTime('date_created', { useTz: false }).notNullable()
      builder.dateTime('date_updated', { useTz: false })

      builder.smallint('priority').unsigned()

      builder.unique(['task_id', 'day'], 'uniq-task_plant_day-task_id-day')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('task_plan_day')
  }
}
