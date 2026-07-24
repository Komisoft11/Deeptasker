import { Migration } from '@mikro-orm/migrations'

export class Migration20230411133452 extends Migration {
  private readonly roles =[{ name: 'Observer', code: 'observer' }]

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex('task_role').insert(this.roles)
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex('task_role').delete().whereIn('code', this.roles.map(r => r.code))
  }
}
