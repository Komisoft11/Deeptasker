import { Migration } from '@mikro-orm/migrations';

export class Migration20240618141043 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('plan', builder => {
      builder.string('description')
    })

    await knex('plan').update({
      name: 'Free',
      description: 'For individuals or small teams managing a limited number of projects and requiring basic project management tool',
    }).where('code', 'free')

    await knex('plan').update({
      description: 'For medium-sized teams needing advanced features like AI assistance for project management',
    }).where('code', 'pro')

    await knex('plan').update({
      description: 'For large organizations with extensive project management needs and unlimited access to AI-powered tools',
    }).where('code', 'business')
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('plan', builder => {
      builder.dropColumn('description')
    })
  }

}
