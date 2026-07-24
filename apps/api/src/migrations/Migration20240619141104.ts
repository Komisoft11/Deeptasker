import { Migration } from '@mikro-orm/migrations';

export class Migration20240619141104 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', builder => {
      builder.string('middle_name')
      builder.date('dob')
      builder.enum('sex', ['M', 'F'])
      builder.string('description')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', builder => {
      builder.dropColumn('middle_name')
      builder.dropColumn('dob')
      builder.dropColumn('sex')
      builder.dropColumn('description')
    })
  }

}
