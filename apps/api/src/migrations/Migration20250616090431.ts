import { Migration } from '@mikro-orm/migrations'

export class Migration20250616090431 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('pending_email_updates', builder => {
      builder.increments('id', { primaryKey: true })
      builder.integer('user_id').nullable()
      builder.string('email').notNullable().unique()

      builder
        .foreign('user_id')
        .references('user.id')
        .onDelete('CASCADE')
        .withKeyName('fk-pending_email_updates-user_id-user-id')
    })

    await knex.schema.alterTable('verification', builder => {
      builder.dropChecks('verification_type_check')
    })

    await knex.schema.alterTable('verification', builder => {
      builder
        .enum('type', ['registration', 'password_reset', 'email_change', 'delete_user'])
        .alter()
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('pending_email_updates')

    await knex.schema.alterTable('verification', builder => {
      builder.dropChecks('verification_type_check')
    })

    await knex.schema.alterTable('verification', builder => {
      builder.enum('type', ['registration', 'password_reset']).alter()
    })
  }
}
