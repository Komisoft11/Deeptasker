import { Migration } from '@mikro-orm/migrations'

export class Migration20250530075022 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('sprint', tableBuilder => {
      tableBuilder.increments('id', { primaryKey: true })
      tableBuilder.string('title').notNullable()
      tableBuilder.string('description')
      tableBuilder
        .enum('status', ['active', 'planned', 'completed'])
        .defaultTo('active')
        .notNullable()
      tableBuilder.dateTime('date_created', { useTz: false }).notNullable()
      tableBuilder.dateTime('date_updated', { useTz: false })
      tableBuilder.dateTime('date_deleted', { useTz: false })
      tableBuilder.dateTime('date_start', { useTz: false }).notNullable()
      tableBuilder.dateTime('date_end', { useTz: false }).notNullable()
      tableBuilder.integer('user_id').unsigned()
      tableBuilder
        .foreign('user_id')
        .references('user.id')
        .onDelete('SET NULL')
        .withKeyName('fk_sprint-user-id_user-id')
      tableBuilder.integer('project_id').unsigned()
      tableBuilder
        .foreign('project_id')
        .references('project.id')
        .onDelete('SET NULL')
        .withKeyName('fk_sprint-project-id_project-id')
    })

    await knex.schema.alterTable('task', builder => {
      builder.integer('sprint_id')
      builder
        .foreign('sprint_id')
        .references('sprint.id')
        .onDelete('CASCADE')
        .withKeyName('fk_task-sprint_id-sprint-id')
    })

    await knex.schema.alterTable('project_permissions', builder => {
      builder.boolean('list_sprints').defaultTo(true)
      builder.boolean('create_sprints').defaultTo(false)
      builder.boolean('update_sprints').defaultTo(false)
      builder.boolean('delete_sprints').defaultTo(false)
    })

    await knex('project_permissions').where('role', 'admin').orWhere('role', 'assigner').update({
      create_sprints: true,
      update_sprints: true,
      delete_sprints: true
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
    await knex.schema.alterTable('task', tableBuilder => {
      tableBuilder.dropColumn('sprint_id')
    })
    await knex.schema.dropTable('sprint')
    await knex.schema.alterTable('project_permissions', builder => {
      builder.dropColumn('list_sprints')
      builder.dropColumn('create_sprints')
      builder.dropColumn('update_sprints')
      builder.dropColumn('delete_sprints')
    })
  }
}
