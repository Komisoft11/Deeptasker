import { Migration } from '@mikro-orm/migrations';

export class Migration20230123124706 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', tableBuilder => {
      tableBuilder.integer('deleted_by_task_id')

      tableBuilder
        .foreign('deleted_by_task_id')
        .references('task.id')
        .onDelete('SET NULL')
        .withKeyName('fk-task-deleted_by_task_id')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', tableBuilder => {
      tableBuilder.dropForeign('deleted_by_task_id', 'fk-task-deleted_by_task_id');
      tableBuilder.dropColumn('deleted_by_task_id')
    })
  }
}
