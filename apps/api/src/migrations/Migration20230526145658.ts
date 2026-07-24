import { Migration } from '@mikro-orm/migrations';

export class Migration20230526145658 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_file', builder => {
      builder.integer('user_id').notNullable()

      builder
        .foreign('user_id', 'fk-task_file-user_id-user')
        .references('id')
        .inTable('user')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task_file', builder => {
      builder.dropColumn('user_id')
    })
  }

}
