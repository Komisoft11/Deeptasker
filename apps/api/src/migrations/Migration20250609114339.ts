import { Migration } from '@mikro-orm/migrations'

export class Migration20250609114339 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('project_member_invitations', builder => {
      builder.increments('id', { primaryKey: true })
      builder.string('email').notNullable()
      builder.integer('sender_id').notNullable()
      builder.integer('project_id').notNullable()
      builder.dateTime('date_created', { useTz: false }).notNullable()
      builder.dateTime('date_expired', { useTz: false }).notNullable()
      builder.string('token').notNullable().unique()
      builder
        .enum('role', ['admin', 'controller', 'assigner', 'user', 'guest'])
        .notNullable()
        .defaultTo('guest')

      builder
        .foreign('sender_id')
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')
        .withKeyName('fk-project_member_invitations-sender_id-user-id')

      builder
        .foreign('project_id')
        .references('id')
        .inTable('project')
        .onDelete('CASCADE')
        .withKeyName('fk-project_member_invitations-project_id-project-id')
    })

    await knex.schema.createTable('workspace_admin_invitations', builder => {
      builder.increments('id', { primaryKey: true })
      builder.string('email').notNullable()
      builder.integer('sender_id').notNullable()
      builder.integer('workspace_id').notNullable()
      builder.dateTime('date_created', { useTz: false }).notNullable()
      builder.dateTime('date_expired', { useTz: false }).notNullable()
      builder.string('token').notNullable().unique()

      builder
        .foreign('sender_id')
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')
        .withKeyName('fk-workspace_admin_invitations-sender_id-user-id')

      builder
        .foreign('workspace_id')
        .references('id')
        .inTable('workspace')
        .onDelete('CASCADE')
        .withKeyName('fk-workspace_admin_invitations-workspace_id-workspace-id')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()
    await knex.schema.dropTable('project_member_invitations')
    await knex.schema.dropTable('workspace_admin_invitations')
  }
}
