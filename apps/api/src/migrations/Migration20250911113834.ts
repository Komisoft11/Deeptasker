import { Migration } from '@mikro-orm/migrations'

export class Migration20250911113834 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    // Сначала удаляем старое ограничение внешнего ключа
    await knex.schema.alterTable('project', tableBuilder => {
      tableBuilder.dropForeign('user_id', 'fk_project-user-id_user-id')
      tableBuilder.dropForeign('user_id', 'fk-project-workspace_id-workspace')
    })

    // Затем добавляем новое ограничение с явным указанием столбца
    await knex.schema.alterTable('project', tableBuilder => {
      tableBuilder
        .foreign('user_id')
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')
        .withKeyName('fk_project-user_id-user')

      tableBuilder
        .foreign('workspace_id')
        .references('id')
        .inTable('workspace')
        .onDelete('CASCADE')
        .withKeyName('fk_project-workspace_id-workspace')
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    // Возвращаем обратно старое ограничение (если нужно)
    await knex.schema.alterTable('project', tableBuilder => {
      tableBuilder.dropForeign('user_id', 'fk_project-user_id-user')
      tableBuilder.dropForeign('user_id', 'fk_project-workspace_id-workspace')
    })

    await knex.schema.alterTable('project', tableBuilder => {
      tableBuilder
        .foreign('user_id')
        .references('user.id')
        .onDelete('CASCADE')
        .withKeyName('fk_project-user-id_user-id')

      tableBuilder
        .foreign('workspace_id', 'fk-project-workspace_id-workspace')
        .references('id')
        .inTable('workspace')
    })
  }
}
