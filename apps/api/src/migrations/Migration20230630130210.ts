import { Migration } from '@mikro-orm/migrations'

export class Migration20230630130210 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    const taskColumns = await knex('task').columnInfo()

    console.log(taskColumns['content'])

    if (taskColumns['content'].type === 'json') {
      await knex.schema.alterTable('task', b => {
        b.text('content').alter({ alterType: true })
      })
      console.log('Changed task.content to TEXT')
    }
  }

  async down(): Promise<void> {
  }
}
