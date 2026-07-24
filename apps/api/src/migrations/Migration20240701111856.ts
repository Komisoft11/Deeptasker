import { Migration } from '@mikro-orm/migrations';

export class Migration20240701111856 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex('notification').delete()
  }

  async down(): Promise<void> {
  }

}
