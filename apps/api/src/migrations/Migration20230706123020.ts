import { Migration } from '@mikro-orm/migrations'

export class Migration20230706123020 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_plan', builder => {
      builder.renameColumn('plan_date', 'start_date')

      builder.date('end_date').notNullable()
      builder.dateTime('date_created').notNullable()
      builder.dateTime('date_updated')
      builder.integer('user_id').notNullable()

      builder
        .foreign('user_id')
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')
        .withKeyName('fk-task_plan-user_id-user')

      builder.unique(['task_id'], { indexName: 'uniq-task_plan-task_id' })
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_plan', builder => {
      builder.renameColumn('start_date', 'plan_date')

      builder.dropColumn('end_date')
      builder.dropColumn('date_created')
      builder.dropColumn('date_updated')

      builder.dropForeign('user_id', 'fk-task_plan-user_id-user')
      builder.dropColumn('user_id')

      builder.dropUnique(['task_id'], 'uniq-task_plan-task_id')
    })
  }
}
