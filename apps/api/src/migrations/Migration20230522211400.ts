import { Migration } from '@mikro-orm/migrations';

export class Migration20230522211400 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('file', builder => {
      builder.string('original_name')
      builder.integer('user_id').notNullable()

      builder
          .foreign('user_id', 'fk-file-user_id-user')
          .references('id')
          .inTable('user')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('file', builder => {
      builder.dropColumn('original_name')
      builder.dropColumn('user_id')
    })
  }

}
