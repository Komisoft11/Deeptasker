import { Migration } from '@mikro-orm/migrations'
import { Knex } from '@mikro-orm/postgresql'

export class Migration20240702125626 extends Migration {
  private roles = ['admin', 'controller', 'assigner', 'user', 'guest']

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project_permissions', builder => {
      builder.enum('role', this.roles).notNullable().defaultTo('guest')

      builder.dropColumn('assigner')
      builder.dropColumn('controller')

      builder.boolean('bind_tasks')
      builder.boolean('change_task_assigner')
      builder.boolean('change_task_executor')
      builder.boolean('confirm_execute_task')
      builder.boolean('delete_task_comments')
      builder.boolean('delete_task_file')
      builder.boolean('delete_tasks')
      builder.boolean('edit_task_description')
      builder.boolean('edit_task_priority')
      builder.boolean('edit_task_tags')
      builder.boolean('edit_task_title')
      builder.boolean('edit_task_deadline')
      builder.boolean('edit_task_status')
      builder.boolean('edit_task_tracking')
      builder.boolean('execute_task')
      builder.boolean('manage_task_observers')
    })

    await this.populateRoles(knex)

    await knex.schema.dropTable('project_user')
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('project_permissions', builder => {
      builder.dropColumn('role')

      builder.boolean('assigner')
      builder.boolean('controller')

      builder.dropColumn('bind_tasks')
      builder.dropColumn('change_task_assigner')
      builder.dropColumn('change_task_executor')
      builder.dropColumn('confirm_execute_task')
      builder.dropColumn('delete_task_comments')
      builder.dropColumn('delete_task_file')
      builder.dropColumn('delete_tasks')
      builder.dropColumn('edit_task_description')
      builder.dropColumn('edit_task_priority')
      builder.dropColumn('edit_task_tags')
      builder.dropColumn('edit_task_title')
      builder.dropColumn('edit_task_deadline')
      builder.dropColumn('edit_task_status')
      builder.dropColumn('edit_task_tracking')
      builder.dropColumn('execute_task')
      builder.dropColumn('manage_task_observers')
    })

    await knex.schema.createTable('project_user', builder => {
      builder.increments('id', { primaryKey: true })
      builder.integer('project_id').notNullable()
      builder.integer('user_id').notNullable()
      builder.string('access')
      builder.dateTime('date_created', { useTz: false }).notNullable()
    })
  }

  private async populateRoles(knex: Knex) {
    const projectAdmins = await knex('project_user').where('access', 'admin')
    for (const projectAdmin of projectAdmins) {
      await knex('project_permissions')
        .update({
          role: 'admin',
          bindTasks: true,
          changeTaskAssigner: true,
          changeTaskExecutor: true,
          confirmExecuteTask: true,
          deleteTaskComments: true,
          deleteTaskFile: true,
          deleteTask: true,
          editTaskDescription: true,
          editTaskPriority: true,
          editTaskTags: true,
          editTaskTitle: true,
          editTaskDeadline: true,
          editTaskTracking: true,
          executeTask: true,
          manageTaskObservers: true
        })
        .where('userId', projectAdmin.userId)
        .where('projectId', projectAdmin.projectId)
    }

    await knex('project_permissions').update({ role: 'user' }).whereNot('role', 'admin')
  }
}
