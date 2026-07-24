import { Migration } from '@mikro-orm/migrations'

export class Migration20250113125558 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('report', builder => {
      builder.increments('id', { primaryKey: true })
      builder.uuid('uuid').notNullable().unique()
      builder.integer('user_id').notNullable()
      builder.dateTime('date_created', { useTz: false }).notNullable()
      builder.dateTime('date_completed', { useTz: false })
      builder
        .enum('status', ['pending', 'in_progress', 'completed', 'error'])
        .defaultTo('pending')
        .notNullable()
      builder.string('error')
      builder.integer('file_id')
      builder.integer('project_id')

      builder
        .foreign('user_id')
        .references('user.id')
        .onDelete('CASCADE')
        .withKeyName('fk-report-user_id-user')
      builder
        .foreign('file_id')
        .references('file.id')
        .onDelete('CASCADE')
        .withKeyName('fk-report-file_id-file')
      builder
        .foreign('project_id')
        .references('project.id')
        .onDelete('CASCADE')
        .withKeyName('fk-report-project_id-project')
    })

    const hasColumn = await knex.schema.hasColumn('project_permissions', 'generate_reports')

    if (!hasColumn) {
      await knex.schema.alterTable('project_permissions', builder => {
        builder.boolean('generate_reports').defaultTo(false)
      })

      await knex('project_permissions').where('role', 'admin').orWhere('role', 'assigner').update({
        generate_reports: true
      })
    }

    await knex('project_permissions')
      .update({ generate_reports: true })
      .whereIn('role', ['admin', 'assigner'])
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('report')

    const hasColumn = await knex.schema.hasColumn('project_permissions', 'generate_reports')

    if (hasColumn) {
      await knex.schema.alterTable('project_permissions', builder => {
        builder.dropColumn('generate_reports')
      })
    }
  }
}
