import { Migration } from '@mikro-orm/migrations';

export class Migration20230227150452 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_timer', tableBuilder => {
      tableBuilder.dropForeign('task_id', 'fk-task_timer-task_id')
      tableBuilder.dropForeign('user_id', 'fk-task_timer-user_id')
    })

    await knex.schema.renameTable('task_timer', 'task_timer_history');

    await knex.schema.alterTable('task_timer_history', tableBuilder => {
      tableBuilder.foreign('task_id').references('task.id').onDelete('CASCADE').withKeyName('fk-task_timer_history-task_id')
      tableBuilder.foreign('user_id').references('user.id').onDelete('CASCADE').withKeyName('fk-task_timer_history-user_id')
    })

    await knex.schema.createTable('task_timer', tableBuilder => {
      tableBuilder.increments('id', { primaryKey: true })
      tableBuilder.integer('task_id').notNullable()
      tableBuilder.integer('user_id').notNullable()
      tableBuilder.integer('seconds').unsigned().defaultTo(0)
      tableBuilder.dateTime('date_created', { useTz: false }).notNullable()
      tableBuilder.dateTime('date_updated', { useTz: false })

      tableBuilder
        .foreign('task_id')
        .references('task.id')
        .onDelete('CASCADE')
        .withKeyName('fk-task_timer-task_id')

      tableBuilder
        .foreign('user_id')
        .references('user.id')
        .onDelete('SET NULL')
        .withKeyName('fk-task_timer-user_id')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_timer', tableBuilder => {
      tableBuilder.dropForeign('task_id', 'fk-task_timer-task_id')
      tableBuilder.dropForeign('user_id', 'fk-task_timer-user_id')
    })

    await knex.schema.dropTable('task_timer')

    await knex.schema.alterTable('task_timer_history', tableBuilder => {
      tableBuilder.dropForeign('task_id', 'fk-task_timer_history-task_id')
      tableBuilder.dropForeign('user_id', 'fk-task_timer_history-user_id')
    })

    await knex.schema.renameTable('task_timer_history', 'task_timer');

    await knex.schema.alterTable('task_timer', tableBuilder => {
      tableBuilder.foreign('task_id').references('task.id').onDelete('CASCADE').withKeyName('fk-task_timer-task_id')
      tableBuilder.foreign('user_id').references('user.id').onDelete('CASCADE').withKeyName('fk-task_timer-user_id')
    })
  }

}
