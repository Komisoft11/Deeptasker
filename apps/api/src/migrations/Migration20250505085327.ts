import { Migration } from '@mikro-orm/migrations'

export class Migration20250505085327 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.dateTime('status_date_updated', { useTz: false }).nullable()
    })

    const tasks: any[] = await knex('task')

    for (const task of tasks) {
      await knex('task').where('id', task.id).update({
        status_date_updated: task.date_updated
      })
    }
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('task', builder => {
      builder.dropColumn('status_date_updated')
    })
  }
}
