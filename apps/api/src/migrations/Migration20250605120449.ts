import { Migration } from '@mikro-orm/migrations'

export class Migration20250605120449 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', builder => {
      builder.integer('avatar_id').nullable()
      builder.string('phone_number').nullable().unique()
      builder
        .foreign('avatar_id')
        .references('file.id')
        .onDelete('CASCADE')
        .withKeyName('fk-user-avatar_id-file-id')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', builder => {
      builder.dropColumn('avatar_id')
      builder.dropColumn('phone_number')
    })
  }
}
