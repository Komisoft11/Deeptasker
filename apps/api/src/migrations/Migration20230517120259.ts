import { Migration } from '@mikro-orm/migrations'

enum SpecialTaskStatusCode {
  open = 'open',
  process = 'process',
  review = 'review',
  executed = 'executed'
}

export class Migration20230517120259 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    const statuses = [
      {
        name: 'Open',
        code: SpecialTaskStatusCode.open,
        color: '#ec9158',
        order: 1
      },
      {
        name: 'In progress',
        code: SpecialTaskStatusCode.process,
        color: '#3271f5',
        order: 2
      },
      {
        name: 'Executed',
        code: SpecialTaskStatusCode.executed,
        color: '#30b367',
        order: 3
      }
    ]

    const projects = await knex('project')
    for (const project of projects) {
      await knex('task_status').insert(statuses.map(s => {
        return {
          project_id: project.id,
          ...s
        }
      }))
    }
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex('task_status').delete()
  }

}
