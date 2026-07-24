import { Migration } from '@mikro-orm/migrations'
import { Migration20230310140939 } from './Migration20230310140939'

export class Migration20230411122438 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('task_role')

    await knex.schema.createTable('task_role', builder => {
      builder.increments('id', { primaryKey: true })
      builder.string('name').notNullable().unique()
      builder.string('code').notNullable().unique()
    })

    await knex.schema.createTable('task_user', builder => {
      builder.increments('id', { primaryKey: true })
      builder.integer('task_id').notNullable()
      builder.integer('user_id').notNullable()
      builder.integer('task_role_id').notNullable()
      builder.dateTime('date_created', { useTz: false }).notNullable()

      builder
        .foreign('task_id', 'fk-task_user-task_id-task')
        .references('id')
        .inTable('task')
        .onDelete('CASCADE')

      builder
        .foreign('user_id', 'fk-task_user-user_id-user')
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')

      builder
        .foreign('task_role_id', 'fk-task_user-task_role_id-task_role')
        .references('id')
        .inTable('task_role')
        .onDelete('CASCADE')

      builder.unique(['task_id', 'user_id', 'task_role_id'])
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('task_user')
    await knex.schema.dropTable('task_role')
    await Migration20230310140939.createTaskRoleTable(knex)
  }
}
