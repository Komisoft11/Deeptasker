import { Migration } from '@mikro-orm/migrations';

export class Migration20230529153031 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('tag', builder => {
      builder.increments('id', { primaryKey: true })
      builder.string('name').notNullable()
      builder.string('color').notNullable()
      builder.integer('project_id').notNullable()

      builder.unique(['name', 'project_id'])

      builder.foreign('project_id', 'fk-tag-project_id-project')
        .references('id')
        .inTable('project')
        .onDelete('CASCADE')
    })

    await knex.schema.createTable('task_tag', builder => {
      builder.increments('id', { primaryKey: true })
      builder.integer('task_id').notNullable()
      builder.integer('tag_id').notNullable()
      builder.integer('user_id')
      builder.dateTime('date_created').notNullable()

      builder.unique(['task_id', 'tag_id'])

      builder.foreign('task_id', 'fk-task_tag-task_id-task')
        .references('id')
        .inTable('task')
        .onDelete('CASCADE')

      builder.foreign('tag_id', 'fk-task_tag-tag_id-tag')
        .references('id')
        .inTable('tag')
        .onDelete('CASCADE')

      builder.foreign('user_id', 'fk-task_tag-user_id-user')
        .references('id')
        .inTable('user')
        .onDelete('SET NULL')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('task_tag')
    await knex.schema.dropTable('tag')
  }
}
