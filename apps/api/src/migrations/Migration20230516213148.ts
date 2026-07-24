import { Migration } from '@mikro-orm/migrations';

export class Migration20230516213148 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', builder => {
      builder.uuid('password_reset_code').unique()
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', builder => {
      builder.dropColumn('password_reset_code')
    })
  }

}
