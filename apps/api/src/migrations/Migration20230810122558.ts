import { Migration } from '@mikro-orm/migrations'
import { Knex } from '@mikro-orm/postgresql'

enum SpecialTaskStatusCode {
  open = 'open',
  process = 'process',
  review = 'review',
  executed = 'executed'
}

export class Migration20230810122558 extends Migration {

	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		interface ITask {
			id: number,
			executor_id: number,
			date_finished: Date,
			project_id: number
		}

		const taskIdsWithoutStatuses = await knex<ITask>('task')
			.select(['id', 'executor_id', 'date_finished', 'project_id'])
			.whereNull('status_id')

		const statusesMap = new Map<number, Map<SpecialTaskStatusCode, number>>()

		for (const task of taskIdsWithoutStatuses) {
			let projectStatuses = statusesMap.get(task.project_id)

			if (!projectStatuses) {
				projectStatuses = await this.loadProjectStatuses(task.project_id, knex)
				statusesMap.set(task.project_id, projectStatuses)
			}

			const status = task.date_finished
				? SpecialTaskStatusCode.executed
				: (task.executor_id ? SpecialTaskStatusCode.process : SpecialTaskStatusCode.open)

			await knex('task').update({
				status_id: projectStatuses.get(status)
			})
				.where('id', task.id)

			console.log('[+] Changed task ' + task.id + ' status to ' + status)
		}

		await knex.schema.alterTable('task', builder => {
			builder.dropForeign('status_id', 'fk-task-status_id-task_status')

			builder.integer('status_id').notNullable().alter({ alterNullable: true })

			builder.foreign('status_id', 'fk-task-status_id-task_status')
				.references('id')
				.inTable('task_status')
				.onDelete('RESTRICT')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('task', builder => {
			builder.dropForeign('status_id', 'fk-task-status_id-task_status')

			builder.foreign('status_id', 'fk-task-status_id-task_status')
				.references('id')
				.inTable('task_status')
				.onDelete('CASCADE')
		})
	}

	private async loadProjectStatuses(projectId: number, knex: Knex): Promise<Map<SpecialTaskStatusCode, number>> {
		const projectStatuses = new Map<SpecialTaskStatusCode, number>()

		const defaultStatuses: any[] = await knex<{ id: number, code: SpecialTaskStatusCode }>('task_status')
			.select(['id', 'code'])
			.where('project_id', projectId)
			.whereIn('code', [SpecialTaskStatusCode.open, SpecialTaskStatusCode.process, SpecialTaskStatusCode.executed])

		if (!defaultStatuses || defaultStatuses.length === 0) {
			throw new Error('No default statuses for project: ' + projectId)
		}

		defaultStatuses.map(status => {
			projectStatuses.set(status.code, status.id)
		})

		return projectStatuses
	}

}