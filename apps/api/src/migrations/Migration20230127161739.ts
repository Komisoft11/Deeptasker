import { Migration } from '@mikro-orm/migrations';

export class Migration20230127161739 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.table('task', tableBuilder => {
      tableBuilder.foreign('project_id')
        .references('project.id')
        .onDelete('CASCADE')
        .withKeyName('fk_task-project_id')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.table('task', tableBuilder => {
      tableBuilder.dropForeign('project_id', 'fk_task-project_id')
    })
  }
}
