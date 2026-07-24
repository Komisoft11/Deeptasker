import { Migration } from '@mikro-orm/migrations'

function generateTaskExternalId(projectSlug: string, position: number): string {
  const match = projectSlug.match(/^(.*?)(?:_(\d+))?$/)
  const base = match[1].toUpperCase()
  const count = match[2] || null
  const names = base.split('-')

  let externalId = ''

  if (names.length > 1) {
    externalId = names[0][0] + names[1][0]
  } else {
    externalId = names[0].slice(0, 2)
  }

  if (count) {
    externalId = externalId + count
  }

  return externalId + `-${position}`
}

export class Migration20250709091437 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.string('external_id').nullable()
    })

    const tasks: any[] = await knex('task')
      .select(
        'task.id',
        'project.slug as projectSlug',
        knex.raw(
          'ROW_NUMBER() OVER (PARTITION BY task.project_id ORDER BY task.date_created ASC) as position'
        )
      )
      .leftJoin('project', 'task.project_id', 'project.id')
      .whereNull('task.external_id')

    for (const task of tasks) {
      const externalId = generateTaskExternalId(task.projectSlug, task.position)

      await knex('task').where('id', task.id).update({
        external_id: externalId
      })

      console.log(`Set external id: ${externalId} for task`)
    }

    await knex.schema.alterTable('task', builder => {
      builder.string('external_id', 20).notNullable().alter()
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.dropColumn('external_id')
    })
  }
}
