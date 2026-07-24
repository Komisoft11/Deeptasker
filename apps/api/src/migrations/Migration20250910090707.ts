import { Migration } from '@mikro-orm/migrations'

export class Migration20250910090707 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project_permissions', builder => {
      builder.dropColumn('create_subprojects')
      builder.dropColumn('bind_tasks')
      builder.dropColumn('list_tasks')
      builder.dropColumn('list_sprints')

      builder.boolean('list_reports')
      builder.boolean('delete_reports')
      builder.boolean('create_tags')
      builder.boolean('update_tags')
      builder.boolean('delete_tags')
    })

    const permissions = await knex('project_permissions')

    for (const permission of permissions) {
      const isListReports =
        permission.role === 'assigner' ||
        permission.role === 'controller' ||
        permission.role === 'admin'

      const isDeleteReports =
        permission.role === 'controller' || permission.role === 'admin'

      const isTagsCreateUpdateDelete = permission.role !== 'guest'

      await knex('project_permissions').where('id', permission.id).update({
        list_reports: isListReports,
        delete_reports: isDeleteReports,
        create_tags: isTagsCreateUpdateDelete,
        update_tags: isTagsCreateUpdateDelete,
        delete_tags: isTagsCreateUpdateDelete
      })
    }
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project_permissions', builder => {
      builder.boolean('create_subprojects').defaultTo(false)
      builder.boolean('bind_tasks').defaultTo(false)
      builder.boolean('list_tasks').defaultTo(true)
      builder.boolean('list_sprints').defaultTo(true)

      builder.dropColumn('list_reports')
      builder.dropColumn('delete_reports')
      builder.dropColumn('create_tags')
      builder.dropColumn('update_tags')
      builder.dropColumn('delete_tags')
    })
  }
}
