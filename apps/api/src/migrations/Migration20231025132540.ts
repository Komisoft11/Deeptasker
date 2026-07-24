import { Migration } from '@mikro-orm/migrations';

export class Migration20231025132540 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    const plan = (await knex('workspace_plan').insert({
      name: 'Free plan',
      code: 'default',
      price: 0,
      num_projects: 3,
      num_members: 5,
      date_created: new Date()
    }).returning('id'))[0]

    await knex('workspace').update({
      'workspace_plan_id': plan.id
    }).whereNull('workspace_plan_id')
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex('workspace as w').update({
      'w.workspace_plan_id': null
    })
      .innerJoin('workspace_plan as wp', 'wp.id', 'w.workspace_plan_id')
      .where('wp.code', 'default')
  }
}
