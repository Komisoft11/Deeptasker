import { Migration } from '@mikro-orm/migrations';
import { Migration20230118083241 } from './Migration20230118083241'

export class Migration20230310154910 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await Migration20230118083241.dropProjectTeamTable(knex)
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await Migration20230118083241.createProjectTeamTable(knex)
  }
}
