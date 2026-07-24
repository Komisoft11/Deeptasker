import { Migration } from '@mikro-orm/migrations';

export class Migration20230516150023 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_parent', tableBuilder => {
      tableBuilder.unique(['task_id', 'parent_id'], 'uniq-task_parent-task_id-parent_id')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_parent', tableBuilder => {
      tableBuilder.dropUnique(['task_id', 'parent_id'], 'uniq-task_parent-task_id-parent_id')
    })
  }
}
