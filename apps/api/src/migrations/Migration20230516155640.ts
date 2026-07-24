import { Migration } from '@mikro-orm/migrations';

export class Migration20230516155640 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('task_status', builder => {
      builder.increments('id', { primaryKey: true })
      builder.integer('project_id').notNullable()
      builder.string('name').notNullable()
      builder.string('code')
      builder.string('color')
      builder.integer('order').unsigned().notNullable()

      builder.unique(['project_id', 'name'], 'uniq-task_status-project_id-name')
      builder.unique(['project_id', 'code'], 'uniq-task_status-project_id-code')

      builder
        .foreign('project_id', 'fk-task_status-project_id-project')
        .references('id')
        .inTable('project')
        .onDelete('CASCADE')
    })

    await knex.schema.alterTable('task', builder => {
      builder.integer('status_id')

      builder.foreign('status_id', 'fk-task-status_id-task_status')
        .references('id')
        .inTable('task_status')
        .onDelete('CASCADE')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_status', builder => {
      builder.dropColumn('status_id')
    })

    await knex.schema.dropTable('task_status')
  }

}
